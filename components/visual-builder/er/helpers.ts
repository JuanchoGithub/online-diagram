export interface SelectedObject {
  id: string;
  type: 'entity' | 'relationship';
}

export interface ErAttribute {
  id: string; // e.g., "attr-CUSTOMER-name"
  type: string;
  name: string;
  keys: string[]; // 'PK', 'FK', 'UK'
  comment: string | null;
  lineIndex: number;
}

export interface ErEntity {
  id: string; // "entity-CUSTOMER"
  name: string;
  attributes: ErAttribute[];
  lineIndex: number;
  label: string; // same as name
}

export interface ErRelationship {
  id: string; // "rel-CUSTOMER-ORDER"
  entity1: string;
  cardinality1: string;
  identification: string; // '--' or '..'
  cardinality2: string;
  entity2: string;
  label: string;
  lineIndex: number;
}

export interface ParsedErObjects {
  entities: ErEntity[];
  relationships: ErRelationship[];
}

const parseErCode = (code: string): ParsedErObjects => {
    const lines = code.split('\n');
    const entities: ErEntity[] = [];
    const relationships: ErRelationship[] = [];

    const entityRegex = /^\s*([a-zA-Z0-9_-]+|"[^"]+")\s*\{?/;
    const relRegex = /^\s*([a-zA-Z0-9_-]+|"[^"]+")\s+([|o}][|o}])\s*(--|\.\.)\s*([|o}][|o}])\s*([a-zA-Z0-9_-]+|"[^"]+")\s*:\s*(.*)/;
    const attrRegex = /^\s*([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s*([A-Z,]*)\s*(".*")?/;

    let currentEntity: ErEntity | null = null;
    let inEntityBlock = false;

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (inEntityBlock) {
            if (trimmed === '}') {
                if (currentEntity) entities.push(currentEntity);
                currentEntity = null;
                inEntityBlock = false;
                return;
            }
            const attrMatch = trimmed.match(attrRegex);
            if (attrMatch && currentEntity) {
                currentEntity.attributes.push({
                    id: `attr-${currentEntity.name}-${attrMatch[2]}`,
                    type: attrMatch[1],
                    name: attrMatch[2],
                    keys: attrMatch[3] ? attrMatch[3].split(',').filter(Boolean) : [],
                    comment: attrMatch[4] ? attrMatch[4].slice(1, -1) : null,
                    lineIndex: index,
                });
            }
            return;
        }

        const relMatch = trimmed.match(relRegex);
        if (relMatch) {
            const [, entity1, card1, ident, card2, entity2, label] = relMatch;
            relationships.push({
                id: `rel-${entity1.replace(/"/g, '')}-${entity2.replace(/"/g, '')}`,
                entity1: entity1.replace(/"/g, ''),
                cardinality1: card1,
                identification: ident,
                cardinality2: card2,
                entity2: entity2.replace(/"/g, ''),
                label: label.trim(),
                lineIndex: index,
            });
            return;
        }

        const entityMatch = trimmed.match(entityRegex);
        if (entityMatch && !trimmed.startsWith('erDiagram') && !trimmed.startsWith('direction')) {
            const name = entityMatch[1].replace(/"/g, '');
            currentEntity = {
                id: `entity-${name}`,
                name,
                attributes: [],
                lineIndex: index,
                label: name
            };
            if (line.includes('{')) {
                inEntityBlock = true;
            } else {
                 entities.push(currentEntity);
                 currentEntity = null;
            }
        }
    });
    
    // Ensure all entities mentioned in relationships are added, even if they have no attributes block
    relationships.forEach(rel => {
        if (!entities.some(e => e.name === rel.entity1)) {
            entities.push({ id: `entity-${rel.entity1}`, name: rel.entity1, attributes: [], lineIndex: -1, label: rel.entity1 });
        }
        if (!entities.some(e => e.name === rel.entity2)) {
            entities.push({ id: `entity-${rel.entity2}`, name: rel.entity2, attributes: [], lineIndex: -1, label: rel.entity2 });
        }
    });

    return { entities, relationships };
};

export const parseSvgForObjects = (svgContainer: HTMLDivElement, code: string): ParsedErObjects => {
    const parsedCode = parseErCode(code);

    parsedCode.entities.forEach(entity => {
        const el = svgContainer.querySelector(`#er_entity_${entity.name}`);
        if (el) el.setAttribute('data-id', entity.id);
    });

    parsedCode.relationships.forEach(rel => {
        const el = svgContainer.querySelector(`#rel_${rel.entity1}-${rel.entity2}`);
        if (el) el.setAttribute('data-id', rel.id);
    });
    
    return parsedCode;
};

export const addEntity = (code: string, name: string): string => {
    const lines = code.split('\n');
    const newEntityCode = `\n    ${name} {\n        string id PK\n    }`;
    lines.push(newEntityCode);
    return lines.join('\n');
};

export const updateEntity = (code: string, oldName: string, newName: string): string => {
    // This is complex because the name is used in relationships too.
    // A simple regex replace is safer for now.
    const oldNameRegex = new RegExp(`\\b${oldName}\\b`, 'g');
    return code.replace(oldNameRegex, newName);
};

export const deleteEntity = (code: string, name: string): string => {
    const lines = code.split('\n');
    const parsed = parseErCode(code);
    const entityToDelete = parsed.entities.find(e => e.name === name);
    if (!entityToDelete) return code;
    
    const linesToKeep = new Set(Array.from({length: lines.length}, (_, i) => i));

    // Remove entity block
    if (entityToDelete.attributes.length > 0) {
        let start = entityToDelete.lineIndex;
        let end = start;
        if (lines[start].includes('{')) {
            let depth = 1;
            for (let i = start + 1; i < lines.length; i++) {
                if (lines[i].includes('{')) depth++;
                if (lines[i].includes('}')) depth--;
                if (depth === 0) {
                    end = i;
                    break;
                }
            }
        }
        for (let i = start; i <= end; i++) {
            linesToKeep.delete(i);
        }
    } else {
        linesToKeep.delete(entityToDelete.lineIndex);
    }
    
    // Remove relationships involving the entity
    parsed.relationships.forEach(rel => {
        if (rel.entity1 === name || rel.entity2 === name) {
            linesToKeep.delete(rel.lineIndex);
        }
    });

    return lines.filter((_, i) => linesToKeep.has(i)).join('\n');
};

export const addAttribute = (code: string, entityName: string, attr: {type: string, name: string, keys: string[]}): string => {
    const lines = code.split('\n');
    const parsed = parseErCode(code);
    const entity = parsed.entities.find(e => e.name === entityName);
    if (!entity) return code;
    
    const keyStr = attr.keys.length > 0 ? ` ${attr.keys.join(',')}` : '';
    const newAttrLine = `        ${attr.type} ${attr.name}${keyStr}`;

    if (entity.attributes.length > 0) {
        const lastAttr = entity.attributes[entity.attributes.length - 1];
        lines.splice(lastAttr.lineIndex + 1, 0, newAttrLine);
    } else { // Entity is defined on one line or has an empty block
        const entityLineIndex = lines.findIndex(l => l.trim().startsWith(entityName));
        if (lines[entityLineIndex].includes('{')) { // empty block
            lines.splice(entityLineIndex + 1, 0, newAttrLine);
        } else { // single line definition
            lines[entityLineIndex] = `${lines[entityLineIndex]} {`;
            lines.splice(entityLineIndex + 1, 0, newAttrLine, '    }');
        }
    }

    return lines.join('\n');
};

export const updateAttribute = (code: string, entityName: string, oldAttrName: string, newAttr: ErAttribute): string => {
    const lines = code.split('\n');
    const parsed = parseErCode(code);
    const entity = parsed.entities.find(e => e.name === entityName);
    const attr = entity?.attributes.find(a => a.name === oldAttrName);
    if (!attr) return code;

    const keyStr = newAttr.keys.length > 0 ? ` ${newAttr.keys.join(',')}` : '';
    const commentStr = newAttr.comment ? ` "${newAttr.comment}"` : '';
    const newLine = `        ${newAttr.type} ${newAttr.name}${keyStr}${commentStr}`;
    lines[attr.lineIndex] = newLine;
    return lines.join('\n');
};

export const deleteAttribute = (code: string, entityName: string, attrName: string): string => {
    const lines = code.split('\n');
    const parsed = parseErCode(code);
    const entity = parsed.entities.find(e => e.name === entityName);
    const attr = entity?.attributes.find(a => a.name === attrName);
    if (!attr) return code;
    
    lines.splice(attr.lineIndex, 1);
    return lines.join('\n');
};

export const updateRelationship = (code: string, lineIndex: number, updates: Partial<ErRelationship>): string => {
    const lines = code.split('\n');
    const parsed = parseErCode(code);
    const rel = parsed.relationships.find(r => r.lineIndex === lineIndex);
    if (!rel) return code;

    const newRel = { ...rel, ...updates };
    const newLine = `    ${newRel.entity1} ${newRel.cardinality1}${newRel.identification}${newRel.cardinality2} ${newRel.entity2} : ${newRel.label}`;
    lines[lineIndex] = newLine;
    return lines.join('\n');
};

export const deleteRelationship = (code: string, lineIndex: number): string => {
    const lines = code.split('\n');
    if (lineIndex >= 0 && lineIndex < lines.length) {
        lines.splice(lineIndex, 1);
    }
    return lines.join('\n');
};