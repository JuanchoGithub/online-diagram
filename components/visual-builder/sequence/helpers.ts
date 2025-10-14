
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

    participantsFromCode.forEach(p => {
        // Mermaid uses a `data-actor` attribute for actors, and the text content for participants
        const el = svgContainer.querySelector(`[data-actor="${p.alias}"]`);
        if (el) {
            el.setAttribute('data-id', p.id);
        } else {
             const textElements = Array.from(svgContainer.querySelectorAll('.participant text'));
             const participantTextEl = textElements.find(t => t.textContent?.trim() === p.label);
             const participantG = participantTextEl?.closest('g.participant');
             if (participantG) {
                participantG.setAttribute('data-id', p.id);
             }
        }
    });

    // Messages are identified by their sequential render order in the SVG
    messagesFromCode.forEach((m, index) => {
        const messagePath = svgContainer.querySelector(`#arrow-line-${index}`);
        const messageLabel = svgContainer.querySelector(`#arrow-label-${index}`);
        const messageGroup = messagePath?.parentElement;

        if(messageGroup) messageGroup.setAttribute('data-id', m.id);
        if(messagePath) messagePath.setAttribute('data-id', m.id);
        if(messageLabel) messageLabel.setAttribute('data-id', m.id);
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
        newLine = `${indentation}${typeKeyword} "${newLabel}" as ${alias} @{ type: "${newType}" }`;
    } else {
        newLine = `${indentation}${typeKeyword} "${newLabel}" as ${alias}`;
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
    const newLine = `${indentation}${messageToUpdate.from}${newArrow}${messageToUpdate.to}: ${newText}`;
    
    lines[lineIndex] = newLine;
    return lines.join('\n');
};
