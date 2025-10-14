export interface SelectedObject {
    id: string;
    type: 'participant' | 'message';
}

export interface Participant {
    id: string; // "participant-{alias}" or "actor-{alias}"
    type: string; // 'participant', 'actor', 'database', etc.
    alias: string;
    label: string;
    lineIndex: number;
}

export interface Message {
    id: string; // "message-{index}"
    from: string;
    to: string;
    arrow: string;
    text: string;
    lineIndex: number;
    label: string;
}

export interface ParsedSequenceObjects {
    participants: Participant[];
    messages: Message[];
}

const getParticipantDetailsFromCode = (code: string): Participant[] => {
    const lines = code.split('\n');
    const participants: Participant[] = [];
    const participantRegex = /^\s*(participant|actor)\s+(?:(?:"([^"]+)"|'([^']+)')\s+as\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)|(?:"([^"]+)"|'([^']+)'))\s*(@\{.*?\})?/;

    lines.forEach((line, index) => {
        const match = line.match(participantRegex);
        if (match) {
            const typeKeyword = match[1];
            const label = match[2] || match[3] || match[6] || match[7] || match[4] || match[5];
            const alias = match[4] || match[5] || label;
            const jsonConfig = match[8];

            let finalType = typeKeyword;
            if (jsonConfig) {
                try {
                    // A simple regex to extract type, avoiding full JSON parsing issues with unquoted keys
                    const typeMatch = jsonConfig.match(/type\s*:\s*"?(\w+)"?/);
                    if (typeMatch && typeMatch[1]) {
                        finalType = typeMatch[1];
                    }
                } catch (e) { /* Ignore parsing errors */ }
            }
            
            participants.push({
                id: `${typeKeyword}-${alias}`,
                type: finalType,
                alias,
                label,
                lineIndex: index,
            });
        }
    });
    return participants;
};

const getMessageDetailsFromCode = (code: string): Message[] => {
    const lines = code.split('\n');
    const messages: Message[] = [];
    const messageRegex = /^\s*([a-zA-Z0-9_]+)\s*(->>|-->>|->|--\)|-x|--x|<<->>|<<-->>)\s*([a-zA-Z0-9_]+)\s*:\s*(.*)/;
    
    let messageCounter = 0;
    lines.forEach((line, index) => {
        const match = line.match(messageRegex);
        if (match) {
            const from = match[1];
            const to = match[3];
            const text = match[4].trim();
            messages.push({
                id: `message-${messageCounter++}`,
                from,
                to,
                arrow: match[2],
                text,
                lineIndex: index,
                label: `${from} → "${text}" → ${to}`,
            });
        }
    });
    return messages;
};

export const parseSvgForObjects = (svgContainer: HTMLDivElement, code: string): ParsedSequenceObjects => {
    const participantsFromCode = getParticipantDetailsFromCode(code);
    const messagesFromCode = getMessageDetailsFromCode(code);

    // Use render order to identify participants and set data-id on the group element.
    const participantGroups = svgContainer.querySelectorAll('.participants > g.actor'); // Mermaid uses g.actor for both participants and actors.
    participantsFromCode.forEach((p, index) => {
        const participantGroup = participantGroups[index];
        if (participantGroup) {
            participantGroup.setAttribute('data-id', p.id);
        }
    });

    // Use modern message group IDs where available, with a fallback.
    messagesFromCode.forEach((m, index) => {
        // Mermaid 10+ uses a more stable ID scheme for message groups.
        const messageGroup = svgContainer.querySelector(`#message-${index}`);
        if (messageGroup) {
            messageGroup.setAttribute('data-id', m.id);
            // Also tag children to ensure click is caught regardless of what part of the message is clicked.
            messageGroup.querySelectorAll('path, text, rect').forEach(child => {
                child.setAttribute('data-id', m.id);
            });
        } else {
            // Fallback for older Mermaid versions that use sequential line/label IDs.
            const messagePath = svgContainer.querySelector(`#arrow-line-${index}`);
            const messageLabel = svgContainer.querySelector(`#arrow-label-${index}`);
            const oldMessageGroup = messagePath?.parentElement;

            if (oldMessageGroup) oldMessageGroup.setAttribute('data-id', m.id);
            if (messagePath) messagePath.setAttribute('data-id', m.id);
            if (messageLabel) messageLabel.setAttribute('data-id', m.id);
        }
    });

    return {
        participants: participantsFromCode,
        messages: messagesFromCode,
    };
};

export const addParticipant = (code: string, type: 'participant' | 'actor'): string => {
    const lines = code.split('\n');
    const existingParticipants = getParticipantDetailsFromCode(code);
    
    let newAliasNum = existingParticipants.length + 1;
    let newAlias = `p${newAliasNum}`;
    while (existingParticipants.some(p => p.alias === newAlias)) {
        newAliasNum++;
        newAlias = `p${newAliasNum}`;
    }

    const newParticipantLine = `  ${type} "${newAlias}" as ${newAlias}`;

    let lastParticipantIndex = -1;
    lines.forEach((line, index) => {
        if (line.trim().startsWith('participant') || line.trim().startsWith('actor')) {
            lastParticipantIndex = index;
        }
    });
    
    if (lastParticipantIndex !== -1) {
        lines.splice(lastParticipantIndex + 1, 0, newParticipantLine);
    } else {
        const diagramDeclIndex = lines.findIndex(line => line.trim().startsWith('sequenceDiagram'));
        lines.splice(diagramDeclIndex + 1, 0, newParticipantLine);
    }
    
    return lines.join('\n');
};

export const updateParticipant = (code: string, alias: string, updates: Partial<Participant>): string => {
    const lines = code.split('\n');
    const participants = getParticipantDetailsFromCode(code);
    const participantToUpdate = participants.find(p => p.alias === alias);

    if (!participantToUpdate) return code;
    
    const { lineIndex } = participantToUpdate;
    const oldLine = lines[lineIndex];

    const newLabel = updates.label ?? participantToUpdate.label;
    const newType = updates.type ?? participantToUpdate.type;
    const isSpecialType = !['participant', 'actor'].includes(newType);

    let newLine = '';
    const typeKeyword = newType === 'actor' ? 'actor' : 'participant';

    const indentation = oldLine.match(/^\s*/)?.[0] || '';

    if (isSpecialType) {
        // For special types, the `as` keyword is invalid.
        // The identifier IS the label. We must use the alias as the identifier
        // to keep message arrows pointing to it. The descriptive label is lost.
        // If the alias has spaces, it must be quoted.
        const identifier = alias.includes(' ') ? `"${alias}"` : alias;
        newLine = `${indentation}${typeKeyword} ${identifier}@{ type: "${newType}" }`;
    } else {
        // For standard types, use `label as alias` if they differ, otherwise just use the label.
        const labelNeedsQuotes = newLabel.includes(' ');
        if (newLabel === alias) {
            newLine = `${indentation}${typeKeyword} ${labelNeedsQuotes ? `"${newLabel}"` : newLabel}`;
        } else {
            newLine = `${indentation}${typeKeyword} "${newLabel}" as ${alias}`;
        }
    }

    lines[lineIndex] = newLine;
    return lines.join('\n');
};

export const updateMessage = (code: string, lineIndex: number, updates: Partial<Message>): string => {
    const lines = code.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return code;
    
    const oldLine = lines[lineIndex];
    const messages = getMessageDetailsFromCode(code);
    const messageToUpdate = messages.find(m => m.lineIndex === lineIndex);
    
    if (!messageToUpdate) return code;

    const newArrow = updates.arrow ?? messageToUpdate.arrow;
    const newText = updates.text ?? messageToUpdate.text;

    const indentation = oldLine.match(/^\s*/)?.[0] || '';
    const newLine = `${indentation}${messageToUpdate.from} ${newArrow} ${messageToUpdate.to}: ${newText}`;
    
    lines[lineIndex] = newLine;
    return lines.join('\n');
};