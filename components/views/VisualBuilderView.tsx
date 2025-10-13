
import React, { useState, useEffect, useCallback } from 'react';
import type { View, ThemeName } from '../../types';
import { DiagramPreview } from '../DiagramPreview';
import { Button } from '../Button';
import { Icon } from '../Icon';

interface Node {
    id: string;
    text: string;
    shape: 'rect' | 'round' | 'stadium' | 'diamond' | 'circle';
}

interface Edge {
    id: string;
    from: string;
    to: string;
    text: string;
}

const SHAPE_SYNTAX: Record<Node['shape'], [string, string]> = {
    rect: ['[', ']'],
    round: ['(', ')'],
    stadium: ['([', '])'],
    diamond: ['{', '}'],
    circle: ['((', '))'],
};

interface VisualBuilderViewProps {
    onGenerateCode: (code: string, targetView: View) => void;
    theme: ThemeName;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const VisualBuilderView: React.FC<VisualBuilderViewProps> = ({ onGenerateCode, theme, showToast }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [generatedCode, setGeneratedCode] = useState('graph TD\n');

    const [newNode, setNewNode] = useState({ id: 'node' + (nodes.length + 1), text: '', shape: 'rect' as Node['shape'] });
    const [newEdge, setNewEdge] = useState({ from: '', to: '', text: '' });

    useEffect(() => {
        let code = 'graph TD\n';
        nodes.forEach(node => {
            const [start, end] = SHAPE_SYNTAX[node.shape];
            code += `    ${node.id}${start}"${node.text}"${end}\n`;
        });
        edges.forEach(edge => {
            code += `    ${edge.from} -->|"${edge.text}"| ${edge.to}\n`;
        });
        setGeneratedCode(code);
    }, [nodes, edges]);

    const addNode = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNode.id && newNode.text && !nodes.find(n => n.id === newNode.id)) {
            setNodes([...nodes, newNode]);
            setNewNode({ id: 'node' + (nodes.length + 2), text: '', shape: 'rect' });
        }
    };

    const addEdge = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEdge.from && newEdge.to) {
            setEdges([...edges, { ...newEdge, id: `edge-${Date.now()}` }]);
            setNewEdge({ from: '', to: '', text: '' });
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="font-semibold mb-3 text-indigo-400">Add Node</h3>
                    <form onSubmit={addNode} className="space-y-3">
                        <input type="text" placeholder="Node ID" value={newNode.id} onChange={e => setNewNode({...newNode, id: e.target.value})} className="w-full bg-gray-700 p-2 rounded" required />
                        <input type="text" placeholder="Node Text" value={newNode.text} onChange={e => setNewNode({...newNode, text: e.target.value})} className="w-full bg-gray-700 p-2 rounded" required />
                        <select value={newNode.shape} onChange={e => setNewNode({...newNode, shape: e.target.value as Node['shape']})} className="w-full bg-gray-700 p-2 rounded">
                            <option value="rect">Rectangle</option>
                            <option value="round">Round</option>
                            <option value="stadium">Stadium</option>
                            <option value="diamond">Diamond</option>
                            <option value="circle">Circle</option>
                        </select>
                        <Button type="submit" className="w-full"><Icon name="add" className="w-4 h-4 mr-2" />Add Node</Button>
                    </form>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="font-semibold mb-3 text-indigo-400">Add Edge</h3>
                    <form onSubmit={addEdge} className="space-y-3">
                        <select value={newEdge.from} onChange={e => setNewEdge({...newEdge, from: e.target.value})} className="w-full bg-gray-700 p-2 rounded" required disabled={nodes.length < 2}>
                            <option value="">From Node</option>
                            {nodes.map(n => <option key={n.id} value={n.id}>{n.text} ({n.id})</option>)}
                        </select>
                         <select value={newEdge.to} onChange={e => setNewEdge({...newEdge, to: e.target.value})} className="w-full bg-gray-700 p-2 rounded" required disabled={nodes.length < 2}>
                            <option value="">To Node</option>
                            {nodes.map(n => <option key={n.id} value={n.id}>{n.text} ({n.id})</option>)}
                        </select>
                        <input type="text" placeholder="Edge Label (optional)" value={newEdge.text} onChange={e => setNewEdge({...newEdge, text: e.target.value})} className="w-full bg-gray-700 p-2 rounded" />
                        <Button type="submit" className="w-full" disabled={nodes.length < 2}><Icon name="add" className="w-4 h-4 mr-2" />Add Edge</Button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                         <h3 className="font-semibold text-indigo-400">Diagram Elements</h3>
                         <Button onClick={() => onGenerateCode(generatedCode, 'editor')} disabled={!nodes.length}>
                            <Icon name="editor" className="w-4 h-4 mr-2"/>Open in Editor
                         </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto">
                        <div>
                            <h4 className="text-sm font-bold mb-2">Nodes</h4>
                            <ul className="space-y-1 text-sm">{nodes.map(n => <li key={n.id} className="bg-gray-700 p-1 px-2 rounded">{n.text}</li>)}</ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold mb-2">Edges</h4>
                            <ul className="space-y-1 text-sm">{edges.map(e => <li key={e.id} className="bg-gray-700 p-1 px-2 rounded">{e.from} -> {e.to}</li>)}</ul>
                        </div>
                    </div>
                </div>
                <div className="h-[calc(100vh-28rem)]">
                    <DiagramPreview code={generatedCode} showToast={showToast} theme={theme} />
                </div>
            </div>
        </div>
    );
};