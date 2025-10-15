export interface SelectedObject {
  id: string;
  type: 'participant' | 'actor' | 'message' | 'note' | 'box' | 'fragment' | 'activation';
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

export interface Note {
  id: string;
  text: string;
  over: string[];
  position: 'left of' | 'right of' | 'over';
  lineIndex: number;
  label: string;
}

export interface Box {
  id: string;
  text: string;
  participants: string[];
  startLine: number;
  endLine: number;
  label: string;
}

export interface Fragment {
  id: string;
  type: 'loop' | 'alt' | 'par' | 'critical' | 'opt' | 'break';
  text: string;
  startLine: number;
  endLine: number;
  label: string;
}

export interface Activation {
  id: string;
  participant: string;
  start: number;
  end: number;
  label: string;
}

export interface ParsedSequenceObjects {
  participants: Participant[];
  messages: Message[];
  autonumber: boolean;
  notes: Note[];
  fragments: Fragment[];
  boxes: Box[];
  activations: Activation[];
}

const getParticipantDetailsFromCode = (code: string): Participant[] => {
    const lines = code.split('\n');
    const participants: Participant[] = [];
    const participantRegex = /^\s*(participant|actor)\s+(?:(?:"([^"]+)"|'([^']+)')\s+as\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)|(?:"([^"]+)"|'([^']+)'))\s*(@\{.*?\})?/;

    lines.forEach((line, index) => {
        const match = line.match(participantRegex);
        if (match) {
            const typeKeyword = match[1];
            const label = match[2] || match[3] || match[6] || match[7] || match[4] || match[5] || '';
            const alias = match[4] || match[5] || label.replace(/\s+/g, '_');
            const jsonConfig = match[8];

            let finalType = typeKeyword;
            if (jsonConfig) {
                try {
                    const typeMatch = jsonConfig.match(/type\s*:\s*"?(\w+)"?/);
                    if (typeMatch && typeMatch[1]) {
                        finalType = typeMatch[1];
                    }
                } catch (e) { /* Ignore parsing errors */ }
            }
            
            if (!participants.some(p => p.alias === alias)) {
                participants.push({
                    id: `${typeKeyword}-${alias}`,
                    type: finalType,
                    alias,
                    label,
                    lineIndex: index,
                });
            }
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
            const text = match[4].trim().replace(/(\+|-)\s*$/, ''); // Remove activation syntax
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

const parseSequenceCode = (code: string): ParsedSequenceObjects => {
    const lines = code.split('\n');
    const participants = getParticipantDetailsFromCode(code);
    const messages = getMessageDetailsFromCode(code);
    const notes: Note[] = [];
    const fragments: Fragment[] = [];
    const boxes: Box[] = [];
    let autonumber = false;

    let noteCounter = 0;
    let boxCounter = 0;
    let fragmentCounter = 0;

    const fragmentStack: Fragment[] = [];
    const boxStack: Box[] = [];

    const noteRegex = /^\s*Note\s+(?:(right of|left of)\s+([a-zA-Z0-9_]+)|over\s+([a-zA-Z0-9_,\s]+))\s*:\s*(.*)/;
    const participantRegex = /^\s*(participant|actor)\s+(?:(?:"([^"]+)"|'([^']+)')\s+as\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)|(?:"([^"]+)"|'([^']+)'))/;


    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed === 'autonumber') {
            autonumber = true;
        }

        if (boxStack.length > 0) {
            const participantMatch = trimmed.match(participantRegex);
            if (participantMatch) {
                const alias = participantMatch[4] || participantMatch[5] || (participantMatch[2] || participantMatch[3] || participantMatch[6] || participantMatch[7] || '').replace(/\s+/g, '_');
                boxStack[boxStack.length - 1].participants.push(alias);
            }
        }

        const noteMatch = trimmed.match(noteRegex);
        if (noteMatch) {
            const position = (noteMatch[1] || 'over') as Note['position'];
            const over = noteMatch[2] ? [noteMatch[2]] : (noteMatch[3] ? noteMatch[3].split(',').map(s => s.trim()) : []);
            const text = noteMatch[4].trim();
            notes.push({
                id: `note-${noteCounter++}`,
                text,
                over,
                position,
                lineIndex: index,
                label: text,
            });
        }
        
        const boxMatch = trimmed.match(/^\s*box\s*(?:rgb\(\d+,\s*\d+,\s*\d+\))?\s*"?([^"]*)"?/);
        if (boxMatch) {
            const newBox: Box = {
                id: `box-${boxCounter++}`,
                text: boxMatch[1],
                participants: [],
                startLine: index,
                endLine: -1,
                label: boxMatch[1] || `Box ${boxCounter}`,
            };
            boxes.push(newBox);
            boxStack.push(newBox);
        }

        const fragmentMatch = trimmed.match(/^\s*(loop|alt|par|critical|opt|break)\s*(.*)/);
        if (fragmentMatch) {
            const newFragment: Fragment = {
                id: `fragment-${fragmentMatch[1]}-${fragmentCounter++}`,
                type: fragmentMatch[1] as Fragment['type'],
                text: fragmentMatch[2],
                startLine: index,
                endLine: -1,
                label: `${fragmentMatch[1]}: ${fragmentMatch[2]}`,
            };
            fragments.push(newFragment);
            fragmentStack.push(newFragment);
        }

        if (trimmed === 'end') {
             if (boxStack.length > 0 && (fragmentStack.length === 0 || boxStack[boxStack.length - 1].startLine > fragmentStack[fragmentStack.length-1].startLine)) {
                const b = boxStack.pop();
                if (b) b.endLine = index;
            } else if (fragmentStack.length > 0) {
                const f = fragmentStack.pop();
                if (f) f.endLine = index;
            }
        }
    });

    return { participants, messages, autonumber, notes, fragments, boxes, activations: [] };
};

export const parseSvgForObjects = (svgContainer: HTMLDivElement, code: string): ParsedSequenceObjects => {
    const parsedCode = parseSequenceCode(code);

    // Use render order to identify participants and set data-id on the group element.
    const participantGroups = svgContainer.querySelectorAll('.participants > g.actor'); // Mermaid uses g.actor for both participants and actors.
    parsedCode.participants.forEach((p, index) => {
        const participantGroup = participantGroups[index];
        if (participantGroup) {
            participantGroup.setAttribute('data-id', p.id);
            // Also tag children to ensure click/hover is caught
            participantGroup.querySelectorAll('rect, text, path, line').forEach(child => {
                child.setAttribute('data-id', p.id);
            });
        }
    });

    // Use modern message group IDs where available
    parsedCode.messages.forEach((m, index) => {
        const messageGroup = svgContainer.querySelector(`#message-${index}`);
        if (messageGroup) {
            messageGroup.setAttribute('data-id', m.id);
            messageGroup.querySelectorAll('path, text, rect').forEach(child => {
                child.setAttribute('data-id', m.id);
            });
        }
    });

    parsedCode.notes.forEach((note, index) => {
        const noteEl = svgContainer.querySelector(`#note-${index}`);
        if (noteEl) {
            noteEl.setAttribute('data-id', note.id);
            noteEl.querySelectorAll('rect, text, path').forEach(child => child.setAttribute('data-id', note.id));
        }
    });

    parsedCode.boxes.forEach((box, index) => {
        const boxEl = svgContainer.querySelector(`#box-group-${index}`);
        if (boxEl) {
            boxEl.setAttribute('data-id', box.id);
            boxEl.querySelectorAll('rect, text').forEach(child => {
                child.setAttribute('data-id', box.id);
            });
        }
    });
    
    const fragmentKeywords = ['loop', 'alt', 'par', 'critical', 'opt', 'break'];
    const allLabelTexts = svgContainer.querySelectorAll('text.labelText');
    const fragmentGroups: Element[] = [];

    allLabelTexts.forEach(textEl => {
        if (fragmentKeywords.includes(textEl.textContent?.trim() || '')) {
            const group = textEl.closest('g');
            if (group && !fragmentGroups.some(g => g.isEqualNode(group))) {
                fragmentGroups.push(group);
            }
        }
    });
    
    fragmentGroups.sort((a, b) => {
        const rectA = a.querySelector('rect');
        const rectB = b.querySelector('rect');
        if (!rectA || !rectB) return 0;
        return parseFloat(rectA.getAttribute('y') || '0') - parseFloat(rectB.getAttribute('y') || '0');
    });

    if (fragmentGroups.length === parsedCode.fragments.length) {
        parsedCode.fragments.forEach((fragment, index) => {
            const fragmentEl = fragmentGroups[index];
            if (fragmentEl) {
                fragmentEl.setAttribute('data-id', fragment.id);
                fragmentEl.querySelectorAll('rect, text, path, line, polygon').forEach(child => child.setAttribute('data-id', fragment.id));
            }
        });
    }

    const activations: Activation[] = [];
    const activationRects = svgContainer.querySelectorAll<SVGRectElement>('rect[class^="activation"]');

    const participantPositions: { alias: string, centerX: number }[] = [];
    parsedCode.participants.forEach((p, index) => {
        const groupEl = participantGroups[index];
        if (groupEl) {
            const line = groupEl.querySelector('line.actor-line');
            if(line) {
                const x = parseFloat(line.getAttribute('x1') || '0');
                participantPositions.push({ alias: p.alias, centerX: x });
            }
        }
    });

    activationRects.forEach((rect) => {
        const x = parseFloat(rect.getAttribute('x') || '0');
        const width = parseFloat(rect.getAttribute('width') || '0');
        const y = parseFloat(rect.getAttribute('y') || '0');
        const height = parseFloat(rect.getAttribute('height') || '0');
        const centerX = x + width / 2;

        let closestParticipant: { alias: string, centerX: number } | null = null;
        let minDistance = Infinity;

        participantPositions.forEach(p => {
            const distance = Math.abs(centerX - p.centerX);
            if (distance < minDistance) {
                minDistance = distance;
                closestParticipant = p;
            }
        });
        
        if (closestParticipant && minDistance < 5) { // Threshold to avoid wrong matches
            const participantAlias = closestParticipant.alias;
            const existingActivation = activations.find(a => a.participant === participantAlias && a.start === y && (a.end - a.start) === height);

            if (!existingActivation) {
                 const activation: Activation = {
                    id: `activation-${participantAlias}-${activations.filter(a => a.participant === participantAlias).length}`,
                    participant: participantAlias,
                    start: y,
                    end: y + height,
                    label: `Activation on ${participantAlias}`
                };
                activations.push(activation);
                rect.setAttribute('data-id', activation.id);
                const parentGroup = rect.parentElement;
                if(parentGroup) parentGroup.setAttribute('data-id', activation.id);
            }
        }
    });

    parsedCode.activations = activations;

    return parsedCode;
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
        const identifier = alias.includes(' ') ? `"${alias}"` : alias;
        newLine = `${indentation}${typeKeyword} ${identifier}@{ type: "${newType}" }`;
    } else {
        const labelNeedsQuotes = newLabel.includes(' ') || newLabel !== alias;
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

export const addNote = (code: string, over?: string): string => {
    const lines = code.split('\n');
    const overParticipant = over || 'A';
    lines.push(`    Note right of ${overParticipant}: New note`);
    return lines.join('\n');
};

export const addFragment = (code: string, type: Fragment['type']): string => {
    const lines = code.split('\n');
    lines.push(`    ${type} New condition`);
    lines.push(`        A->>B: Action`);
    lines.push(`    end`);
    return lines.join('\n');
};

export const addBox = (code: string,): string => {
    const lines = code.split('\n');
    lines.push(`    box "New Group"`);
    lines.push(`        participant C`);
    lines.push(`    end`);
    return lines.join('\n');
};

export const toggleAutonumber = (code: string): string => {
    const lines = code.split('\n');
    const autonumberIndex = lines.findIndex(l => l.trim() === 'autonumber');
    if (autonumberIndex !== -1) {
        lines.splice(autonumberIndex, 1);
    } else {
        const declIndex = lines.findIndex(l => l.trim().startsWith('sequenceDiagram'));
        lines.splice(declIndex + 1, 0, '    autonumber');
    }
    return lines.join('\n');
};

export const updateNote = (code: string, lineIndex: number, updates: Partial<Note> & { position?: string }): string => {
    const lines = code.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return code;
    const oldLine = lines[lineIndex];

    const noteRegex = /^\s*Note\s+(?:(right of|left of)\s+([a-zA-Z0-9_]+)|over\s+([a-zA-Z0-9_,\s]+))\s*:\s*(.*)/;
    const match = oldLine.trim().match(noteRegex);
    if (!match) return code;

    const oldPosition = match[1] || 'over';
    const oldParticipants = (match[2] ? [match[2]] : match[3].split(',').map(s => s.trim()));
    const oldText = match[4];

    const newText = updates.text ?? oldText;
    const newPosition = updates.position ?? oldPosition;
    const newParticipants = updates.over ?? oldParticipants;
    
    let positionStr = '';
    if (newParticipants.length > 0) {
        if (newPosition === 'over') {
            positionStr = `over ${newParticipants.join(',')}`;
        } else {
            positionStr = `${newPosition} ${newParticipants[0]}`;
        }
    }
    
    const indentation = oldLine.match(/^\s*/)?.[0] || '';
    const newLine = `${indentation}Note ${positionStr}: ${newText}`;

    lines[lineIndex] = newLine;
    return lines.join('\n');
};

export const updateBox = (code: string, box: Box, updates: { title?: string, participants?: string[] }): string => {
    let newLines = code.split('\n');
    
    if (updates.title !== undefined && updates.title !== box.text) {
        const oldLine = newLines[box.startLine];
        const indentation = oldLine.match(/^\s*/)?.[0] || '';
        const needsQuotes = updates.title.includes(' ');
        const titlePart = needsQuotes ? `"${updates.title}"` : updates.title;
        const newLine = `${indentation}box ${titlePart}`;
        newLines[box.startLine] = newLine;
    }

    if (updates.participants) {
        const contentWithoutParticipants = newLines
            .slice(box.startLine + 1, box.endLine)
            .filter(line => !line.trim().startsWith('participant ') && !line.trim().startsWith('actor '));

        const indentation = (newLines[box.startLine].match(/^\s*/)?.[0] || '') + '    ';
        const newParticipantLines = updates.participants.map(pAlias => `${indentation}participant ${pAlias}`);
        
        newLines = [
            ...newLines.slice(0, box.startLine + 1),
            ...newParticipantLines,
            ...contentWithoutParticipants,
            ...newLines.slice(box.endLine)
        ];
    }
    
    return newLines.join('\n');
};

export const updateFragment = (code: string, lineIndex: number, newText: string): string => {
    const lines = code.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return code;
    
    const oldLine = lines[lineIndex];
    const fragmentMatch = oldLine.trim().match(/^\s*(loop|alt|par|critical|opt|break)\s*(.*)/);
    if (!fragmentMatch) return code;

    const type = fragmentMatch[1];
    const indentation = oldLine.match(/^\s*/)?.[0] || '';
    const newLine = `${indentation}${type} ${newText}`;
    
    lines[lineIndex] = newLine;
    return lines.join('\n');
};

export const addMessageToFragment = (code: string, fragment: Fragment, message: { from: string, to: string, text: string, arrow: string }): string => {
    const lines = code.split('\n');
    if (fragment.endLine < 0 || fragment.endLine >= lines.length) return code;
    
    const endLine = lines[fragment.endLine];
    const indentation = (endLine.match(/^\s*/)?.[0] || '') + '    ';
    
    const newMessageLine = `${indentation}${message.from} ${message.arrow} ${message.to}: ${message.text}`;

    let insertIndex = fragment.endLine;
    
    if (fragment.type === 'alt') {
        for (let i = fragment.startLine + 1; i < fragment.endLine; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith('else')) {
                insertIndex = i;
                break;
            }
        }
    }
    
    lines.splice(insertIndex, 0, newMessageLine);
    return lines.join('\n');
};