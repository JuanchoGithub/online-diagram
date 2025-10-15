import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ThemeName } from '../../../types';
import { Icon } from '../../Icon';
import { Button } from '../../Button';
import { SequenceSidebar } from './SequenceSidebar';
import { TooltipButton } from '../shared/TooltipButton';
import {
  parseSvgForObjects,
  ParsedSequenceObjects,
  addParticipant,
  addNote,
  addFragment,
  addBox,
  toggleAutonumber,
  type SelectedObject,
} from './helpers';
import { ConfirmationModal } from '../../ConfirmationModal';

interface SequenceBuilderProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  theme: ThemeName;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const SequenceBuilder: React.FC<SequenceBuilderProps> = ({ code, onCodeChange, theme, showToast }) => {
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [diagramObjects, setDiagramObjects] = useState<ParsedSequenceObjects>({
    participants: [],
    messages: [],
    autonumber: false,
    notes: [],
    fragments: [],
    boxes: [],
    activations: [],
  });
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [sidebarSize, setSidebarSize] = useState(25);
  const [isResizing, setIsResizing] = useState(false);

  const [isPanMode, setIsPanMode] = useState(false);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  const hoveredElementRef = useRef<Element | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPointRef = useRef<{ x: number; y: number; target: HTMLElement | null } | null>(null);
  const mermaidId = 'visual-builder-sequence-preview';

  const highlightColor = useMemo(() => {
    switch (theme) {
        case 'dark':
        case 'forest':
            return '#FBBF24'; // amber-400
        case 'default':
        case 'neutral':
        default:
            return '#3B82F6'; // blue-500
    }
  }, [theme]);

  const handleMouseDownOnDivider = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleDeleteSelectedObject = useCallback(() => {
    showToast("Deletion for sequence diagrams is not yet implemented.", 'info');
  }, [showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'v' && e.target && !['TEXTAREA', 'INPUT', 'SELECT'].includes((e.target as HTMLElement).nodeName)) {
        e.preventDefault();
        setIsPanMode(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSelectedObject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newSidebarWidth = containerRect.right - e.clientX;
        const newSize = (newSidebarWidth / containerRect.width) * 100;
        setSidebarSize(Math.max(15, Math.min(50, newSize)));
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  useEffect(() => {
    const renderMermaid = async () => {
      const trimmedCode = code.trim();
      if (!trimmedCode.startsWith('sequenceDiagram')) {
        setSvgContent('');
        setError(null);
        setDiagramObjects({ participants: [], messages: [], autonumber: false, notes: [], fragments: [], boxes: [], activations: [] });
        return;
      }
      try {
        setError(null);
        const { svg } = await (window as any).mermaid.render(mermaidId, trimmedCode);
        setSvgContent(svg);
      } catch (e: any) {
        const errorMessage = e.message || 'Invalid Sequence Diagram syntax.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        setSvgContent('');
        setDiagramObjects({ participants: [], messages: [], autonumber: false, notes: [], fragments: [], boxes: [], activations: [] });
      }
    };
    const timeoutId = setTimeout(renderMermaid, 300);
    return () => clearTimeout(timeoutId);
  }, [code, theme, showToast]);

  useEffect(() => {
    if (svgContent && svgContainerRef.current) {
      const timer = setTimeout(() => {
        if (svgContainerRef.current) {
          const objects = parseSvgForObjects(svgContainerRef.current, code);
          setDiagramObjects(objects);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [svgContent, code]);

  useEffect(() => {
    if (!svgContainerRef.current) return;
    const previouslySelected = svgContainerRef.current.querySelectorAll('.selected-object');
    previouslySelected.forEach(el => el.classList.remove('selected-object'));

    if (selectedObject) {
      const elementsToSelect = svgContainerRef.current.querySelectorAll(`[data-id="${CSS.escape(selectedObject.id)}"]`);
      elementsToSelect.forEach(elementToSelect => {
        if (elementToSelect) {
          elementToSelect.classList.add('selected-object');
        }
      });
    }
  }, [selectedObject, svgContent]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanMode) {
      if (e.button !== 0) return;
      e.preventDefault();
      setIsPanning(true);
      setStartPoint({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      return;
    }
    dragStartPointRef.current = { x: e.clientX, y: e.clientY, target: e.target as HTMLElement };
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning || isResizing) return;
    const target = e.target as HTMLElement;
    const objectGroup = target.closest('[data-id]');

    if (hoveredElementRef.current && hoveredElementRef.current !== objectGroup) {
        hoveredElementRef.current.classList.remove('hovered-object');
        hoveredElementRef.current = null;
    }

    if (objectGroup && objectGroup !== hoveredElementRef.current) {
        objectGroup.classList.add('hovered-object');
        hoveredElementRef.current = objectGroup;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanMode && isPanning) {
      e.preventDefault();
      const newX = e.clientX - startPoint.x;
      const newY = e.clientY - startPoint.y;
      setTransform(t => ({ ...t, x: newX, y: newY }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanMode) {
      setIsPanning(false);
      return;
    }

    if (!dragStartPointRef.current) return;

    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPointRef.current.x, 2) +
      Math.pow(e.clientY - dragStartPointRef.current.y, 2)
    );

    if (dragDistance < 5) { // It's a click, not a drag.
      const target = dragStartPointRef.current.target;
      const el = target.closest<HTMLElement>('[data-id]');
      if (el?.dataset.id) {
          const [type] = el.dataset.id.split('-');
          if (['participant', 'actor', 'message', 'note', 'box', 'fragment', 'activation'].includes(type)) {
              setSelectedObject({ id: el.dataset.id, type: type as SelectedObject['type'] });
          }
      } else {
        setSelectedObject(null);
      }
    }

    dragStartPointRef.current = null;
  };

  const handleMouseLeave = () => {
    if (isPanMode) {
      setIsPanning(false);
    }
    dragStartPointRef.current = null;
    if (hoveredElementRef.current) {
        hoveredElementRef.current.classList.remove('hovered-object');
        hoveredElementRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!svgContainerRef.current) return;

    const rect = svgContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleAmount = -e.deltaY * 0.001 * transform.scale;
    const newScale = Math.max(0.1, Math.min(5, transform.scale + scaleAmount));
    const scaleRatio = newScale / transform.scale;
    const newX = mouseX - scaleRatio * (mouseX - transform.x);
    const newY = mouseY - scaleRatio * (mouseY - transform.y);
    setTransform({ scale: newScale, x: newX, y: newY });
  };

  const zoomIn = () => setTransform(t => ({ ...t, scale: Math.min(t.scale + 0.2, 5) }));
  const zoomOut = () => setTransform(t => ({ ...t, scale: Math.max(t.scale - 0.2, 0.1) }));
  const resetTransform = () => setTransform({ scale: 1, x: 0, y: 0 });

  const handleFitToScreen = useCallback(() => {
    if (!svgContainerRef.current) return;
    const wrapper = svgContainerRef.current.children[0] as HTMLDivElement;
    const mainGroup = wrapper?.querySelector('svg g');
    if (!mainGroup) return;

    // Get the rendered positions and dimensions from the browser
    const groupRect = mainGroup.getBoundingClientRect();
    const containerRect = svgContainerRef.current.getBoundingClientRect();

    if (groupRect.width === 0 || groupRect.height === 0) return;

    // To calculate the "intrinsic" (un-transformed) size and position,
    // we must reverse the current pan and zoom from the rendered dimensions.
    const intrinsicWidth = groupRect.width / transform.scale;
    const intrinsicHeight = groupRect.height / transform.scale;
    
    // The rendered groupRect.left is a result of several transforms:
    // groupRect.left = containerRect.left + transform.x + (intrinsicLeft * transform.scale)
    // We solve for intrinsicLeft to find the diagram's true origin:
    const intrinsicLeft = (groupRect.left - containerRect.left - transform.x) / transform.scale;
    const intrinsicTop = (groupRect.top - containerRect.top - transform.y) / transform.scale;

    // With the true, un-transformed bounds, we can calculate the correct scale and translation.
    const padding = 40;
    const availableWidth = containerRect.width - padding;
    const availableHeight = containerRect.height - padding;

    const newScale = Math.min(
        availableWidth / intrinsicWidth,
        availableHeight / intrinsicHeight,
        2 // Cap max zoom at 2x
    );

    // Find the center of the intrinsic content
    const intrinsicCenterX = intrinsicLeft + intrinsicWidth / 2;
    const intrinsicCenterY = intrinsicTop + intrinsicHeight / 2;

    // Calculate the translation needed to move the scaled center to the container's center.
    // newTranslation = containerCenter - scaledIntrinsicCenter
    const newX = (containerRect.width / 2) - (intrinsicCenterX * newScale);
    const newY = (containerRect.height / 2) - (intrinsicCenterY * newScale);

    setTransform({ scale: newScale, x: newX, y: newY });
  }, [transform]);

  const handleAddParticipant = (type: 'participant' | 'actor') => {
    onCodeChange(addParticipant(code, type));
    showToast(`Added new ${type}.`, 'success');
  };

  const handleAddNote = () => {
    onCodeChange(addNote(code, diagramObjects.participants[0]?.alias));
    showToast(`Added new note.`, 'success');
  }

  const handleAddFragment = (type: 'loop' | 'alt' | 'par' | 'critical' | 'opt' | 'break') => {
    onCodeChange(addFragment(code, type));
    showToast(`Added new ${type} fragment.`, 'success');
  }

  const handleAddBox = () => {
    onCodeChange(addBox(code));
    showToast('Added new box.', 'success');
  }

  const handleToggleAutonumber = () => {
    onCodeChange(toggleAutonumber(code));
  }

  return (
    <div ref={containerRef} className="flex h-full">
      <main
        className="bg-gray-800 rounded-lg shadow-lg flex flex-col relative overflow-hidden"
        style={{ width: `calc(100% - ${sidebarSize}% - 8px)` }}
      >
        <div className="flex-shrink-0 bg-gray-700 p-2 px-4 flex justify-between items-center rounded-t-lg">
          <h3 className="text-sm font-semibold text-gray-300">Sequence Diagram Canvas</h3>
          <div className="flex items-center gap-2">
            <TooltipButton onClick={() => setIsPanMode(!isPanMode)} className={isPanMode ? '!bg-indigo-500' : ''} aria-label="Toggle Pan Mode (V)" iconName="pan" tooltipText="Pan (V)" />
            <div className="border-l border-gray-600 h-6 mx-1"></div>
            <TooltipButton onClick={handleToggleAutonumber} className={diagramObjects.autonumber ? '!bg-indigo-500' : ''} aria-label="Toggle Autonumber" iconName="autonumber" tooltipText="Toggle Autonumber"/>
            <TooltipButton onClick={handleAddBox} aria-label="Add Box" iconName="folder" tooltipText="Add Box" />
            <TooltipButton onClick={handleAddNote} aria-label="Add Note" iconName="note" tooltipText="Add Note" />
            <div className="border-l border-gray-600 h-6 mx-1"></div>
            <TooltipButton onClick={() => handleAddParticipant('participant')} aria-label="Add Participant" iconName="square" tooltipText="Add Participant" />
            <TooltipButton onClick={() => handleAddParticipant('actor')} aria-label="Add Actor" iconName="user" tooltipText="Add Actor" />
            <div className="border-l border-gray-600 h-6 mx-1"></div>
            <TooltipButton onClick={() => handleAddFragment('loop')} aria-label="Add Loop" iconName="refresh-cw" tooltipText="Add Loop"/>
            <TooltipButton onClick={() => handleAddFragment('alt')} aria-label="Add Alt" iconName="alt" tooltipText="Add Alt/Else"/>
            <TooltipButton onClick={() => handleAddFragment('par')} aria-label="Add Parallel" iconName="par" tooltipText="Add Parallel"/>
          </div>
        </div>

        <style>{`
            .selected-object {
                outline: 3px solid #6366F1; /* Indigo-500 */
                outline-offset: 4px;
                border-radius: 4px;
            }
            .hovered-object {
                outline: 2px solid ${highlightColor};
                outline-offset: 2px;
                border-radius: 4px;
            }
            .visual-canvas svg {
                max-width: none; max-height: none; height: auto; overflow: visible;
            }
            .visual-canvas [data-id] {
                 cursor: pointer;
            }
        `}</style>

        <div
          ref={svgContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseOver={handleMouseOver}
          onWheel={handleWheel}
          className="w-full h-full p-4 visual-canvas flex-grow relative grid place-items-center overflow-hidden"
          style={{ cursor: isPanMode ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
        >
          <div
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {error && (
              <div className="text-red-400 bg-red-900/50 rounded-md font-mono text-sm max-w-lg relative z-0 text-center p-4">
                {error}
              </div>
            )}
            {!error && svgContent && (
              <div className="relative z-0" dangerouslySetInnerHTML={{ __html: svgContent }} />
            )}
            {!error && !svgContent && (
              <div className="text-center text-gray-500 relative z-0">
                <Icon name="git-commit" className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p>Your sequence diagram will appear here.</p>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg">
            <Button onClick={zoomIn} className="!p-2" title="Zoom In"><Icon name="zoom-in" className="w-4 h-4" /></Button>
            <Button onClick={zoomOut} className="!p-2" title="Zoom Out"><Icon name="zoom-out" className="w-4 h-4" /></Button>
            <Button onClick={handleFitToScreen} className="!p-2" title="Fit to Screen"><Icon name="maximize" className="w-4 h-4" /></Button>
            <Button onClick={resetTransform} className="!p-2" title="Reset View"><Icon name="refresh-cw" className="w-4 h-4" /></Button>
          </div>
        </div>
      </main>

      <div
        onMouseDown={handleMouseDownOnDivider}
        className="h-full w-2 flex-shrink-0 cursor-col-resize bg-gray-700 hover:bg-indigo-500 transition-colors"
        aria-label="Resize sidebar"
      />

      <SequenceSidebar
        sidebarSize={sidebarSize}
        code={code}
        onCodeChange={onCodeChange}
        selectedObject={selectedObject}
        setSelectedObject={setSelectedObject}
        diagramObjects={diagramObjects}
        onDeleteObject={handleDeleteSelectedObject}
      />
    </div>
  );
};