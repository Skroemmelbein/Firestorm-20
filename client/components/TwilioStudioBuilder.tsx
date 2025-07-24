import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap,
  Phone,
  MessageSquare,
  Bot,
  Users,
  Clock,
  Send,
  Mic,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
  Settings,
  Play,
  Save,
  Download,
  Upload,
  Brain,
  Sparkles,
  Target,
  Activity,
} from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'trigger' | 'send_message' | 'gather_input' | 'conditional' | 'ai_response' | 'transfer' | 'record' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    message?: string;
    condition?: string;
    timeout?: number;
    next?: string[];
  };
}

interface FlowConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export default function TwilioStudioBuilder() {
  const [nodes, setNodes] = useState<FlowNode[]>([
    {
      id: 'trigger_1',
      type: 'trigger',
      position: { x: 100, y: 100 },
      data: { label: 'Incoming Call/SMS' }
    }
  ]);
  
  const [connections, setConnections] = useState<FlowConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [flowName, setFlowName] = useState('New AI Flow');
  const [isAIMode, setIsAIMode] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const nodeTypes = [
    { type: 'send_message', label: 'Send Message', icon: MessageSquare, color: '#FF6A00' },
    { type: 'gather_input', label: 'Gather Input', icon: Mic, color: '#00E676' },
    { type: 'conditional', label: 'Split Based On', icon: Target, color: '#FFD700' },
    { type: 'ai_response', label: 'AI Response', icon: Brain, color: '#8A2BE2' },
    { type: 'transfer', label: 'Transfer Call', icon: Phone, color: '#00CED1' },
    { type: 'record', label: 'Record Voicemail', icon: Mic, color: '#FF2D55' },
    { type: 'end', label: 'End Flow', icon: XCircle, color: '#DC143C' }
  ];

  const addNode = (type: string) => {
    const newNode: FlowNode = {
      id: `${type}_${Date.now()}`,
      type: type as any,
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 300 + 200 
      },
      data: { 
        label: nodeTypes.find(nt => nt.type === type)?.label || type,
        message: type === 'send_message' ? 'Hello! How can I help you today?' : undefined,
        condition: type === 'conditional' ? 'input.body contains "help"' : undefined
      }
    };
    setNodes([...nodes, newNode]);
  };

  const generateAIFlow = async () => {
    const aiGeneratedNodes: FlowNode[] = [
      {
        id: 'trigger_ai',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: { label: 'AI Flow Start' }
      },
      {
        id: 'ai_greeting',
        type: 'ai_response',
        position: { x: 250, y: 50 },
        data: { 
          label: 'AI Greeting',
          message: 'AI will analyze customer intent and respond appropriately'
        }
      },
      {
        id: 'check_availability',
        type: 'conditional',
        position: { x: 450, y: 50 },
        data: { 
          label: 'Agent Available?',
          condition: 'agents.available > 0'
        }
      },
      {
        id: 'transfer_agent',
        type: 'transfer',
        position: { x: 650, y: 50 },
        data: { label: 'Transfer to Agent' }
      },
      {
        id: 'ai_conversation',
        type: 'ai_response',
        position: { x: 450, y: 200 },
        data: { 
          label: 'AI Conversation',
          message: 'Continue AI-powered conversation to resolve customer needs'
        }
      },
      {
        id: 'record_vm',
        type: 'record',
        position: { x: 650, y: 350 },
        data: { label: 'Record Voicemail' }
      }
    ];

    setNodes(aiGeneratedNodes);
    
    const aiConnections: FlowConnection[] = [
      { id: 'conn_1', source: 'trigger_ai', target: 'ai_greeting', label: 'start' },
      { id: 'conn_2', source: 'ai_greeting', target: 'check_availability', label: 'analyzed' },
      { id: 'conn_3', source: 'check_availability', target: 'transfer_agent', label: 'yes' },
      { id: 'conn_4', source: 'check_availability', target: 'ai_conversation', label: 'no' },
      { id: 'conn_5', source: 'ai_conversation', target: 'record_vm', label: 'escalate' }
    ];
    
    setConnections(aiConnections);
  };

  const saveFlow = async () => {
    const flowData = {
      name: flowName,
      nodes,
      connections,
      created_at: new Date().toISOString()
    };
    
    console.log('Saving Twilio Studio Flow:', flowData);
    // Here we would integrate with Twilio Studio API
  };

  const NodeComponent = ({ node }: { node: FlowNode }) => {
    const nodeConfig = nodeTypes.find(nt => nt.type === node.type);
    const Icon = nodeConfig?.icon || Activity;
    
    return (
      <div
        className={`absolute cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-2xl ${
          selectedNode?.id === node.id ? 'ring-2 ring-[#FF6A00] shadow-[#FF6A00]/50' : ''
        }`}
        style={{ 
          left: node.position.x, 
          top: node.position.y,
          transform: selectedNode?.id === node.id ? 'scale(1.1)' : 'scale(1)'
        }}
        onClick={() => setSelectedNode(node)}
      >
        <div 
          className="bg-[#1E1E22] border-2 p-4 min-w-[150px] text-center shadow-xl backdrop-blur-sm"
          style={{ 
            borderColor: nodeConfig?.color || '#FF6A00',
            boxShadow: `0 0 20px ${nodeConfig?.color || '#FF6A00'}30`
          }}
        >
          <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: nodeConfig?.color }} />
          <div className="text-sm font-bold text-white">{node.data.label}</div>
          {node.data.message && (
            <div className="text-xs text-gray-400 mt-1 truncate">
              {node.data.message.substring(0, 30)}...
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6A00]/10 via-[#0F0F10] to-[#FF2D55]/10">
      {/* Header */}
      <div className="border-b border-[#FF6A00]/20 bg-black/90 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6A00] to-[#FF2D55] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">TWILIO STUDIO AI BUILDER</h1>
              <p className="text-sm text-[#FF6A00]">Build intelligent conversation flows</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={generateAIFlow}
              className="bg-gradient-to-r from-[#8A2BE2] to-[#FF69B4] text-white hover:from-[#FF69B4] hover:to-[#8A2BE2]"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI GENERATE FLOW
            </Button>
            <Button 
              onClick={saveFlow}
              className="bg-gradient-to-r from-[#FF6A00] to-[#FF2D55] text-white hover:from-[#FF2D55] hover:to-[#FF6A00]"
            >
              <Save className="w-4 h-4 mr-2" />
              DEPLOY TO TWILIO
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Node Palette */}
        <div className="w-80 bg-[#1E1E22]/90 backdrop-blur-xl border-r border-[#FF6A00]/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">FLOW COMPONENTS</h3>
          
          <div className="space-y-3">
            {nodeTypes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <Button
                  key={nodeType.type}
                  onClick={() => addNode(nodeType.type)}
                  className="w-full justify-start bg-[#2A2A2E] hover:bg-[#3A3A3E] border border-transparent hover:border-[#FF6A00]/50 transition-all duration-200"
                  style={{
                    boxShadow: `0 0 10px ${nodeType.color}20`
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" style={{ color: nodeType.color }} />
                  <span className="text-white">{nodeType.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="mt-8">
            <h4 className="text-md font-bold text-white mb-3">FLOW SETTINGS</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-white text-xs">Flow Name</Label>
                <Input 
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="bg-[#2A2A2E] border-[#FF6A00]/30 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={isAIMode}
                  onChange={(e) => setIsAIMode(e.target.checked)}
                  className="accent-[#FF6A00]"
                />
                <Label className="text-white text-xs">AI-Powered Flow</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={canvasRef}
            className="w-full h-full bg-gradient-to-br from-[#0F0F10] via-[#1A1A1A] to-[#0F0F10] relative"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20px 20px, #FF6A00 1px, transparent 1px),
                radial-gradient(circle at 80px 80px, #FF2D55 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px, 160px 160px'
            }}
          >
            {/* Render Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((conn) => {
                const sourceNode = nodes.find(n => n.id === conn.source);
                const targetNode = nodes.find(n => n.id === conn.target);
                if (!sourceNode || !targetNode) return null;
                
                return (
                  <line
                    key={conn.id}
                    x1={sourceNode.position.x + 75}
                    y1={sourceNode.position.y + 40}
                    x2={targetNode.position.x + 75}
                    y2={targetNode.position.y + 40}
                    stroke="#FF6A00"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                );
              })}
            </svg>

            {/* Render Nodes */}
            {nodes.map((node) => (
              <NodeComponent key={node.id} node={node} />
            ))}

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto text-[#FF6A00] mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-white mb-2">Start Building Your AI Flow</h3>
                  <p className="text-gray-400 mb-4">Add components from the palette or generate an AI flow</p>
                  <Button 
                    onClick={generateAIFlow}
                    className="bg-gradient-to-r from-[#FF6A00] to-[#FF2D55] text-white"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate AI Flow
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-[#1E1E22]/90 backdrop-blur-xl border-l border-[#FF6A00]/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4">NODE PROPERTIES</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white text-xs">Node Label</Label>
                <Input 
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    const updatedNodes = nodes.map(n => 
                      n.id === selectedNode.id 
                        ? { ...n, data: { ...n.data, label: e.target.value } }
                        : n
                    );
                    setNodes(updatedNodes);
                    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: e.target.value } });
                  }}
                  className="bg-[#2A2A2E] border-[#FF6A00]/30 text-white"
                />
              </div>

              {selectedNode.type === 'send_message' && (
                <div>
                  <Label className="text-white text-xs">Message</Label>
                  <Textarea 
                    value={selectedNode.data.message || ''}
                    onChange={(e) => {
                      const updatedNodes = nodes.map(n => 
                        n.id === selectedNode.id 
                          ? { ...n, data: { ...n.data, message: e.target.value } }
                          : n
                      );
                      setNodes(updatedNodes);
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, message: e.target.value } });
                    }}
                    className="bg-[#2A2A2E] border-[#FF6A00]/30 text-white"
                    rows={3}
                  />
                </div>
              )}

              {selectedNode.type === 'conditional' && (
                <div>
                  <Label className="text-white text-xs">Condition</Label>
                  <Input 
                    value={selectedNode.data.condition || ''}
                    onChange={(e) => {
                      const updatedNodes = nodes.map(n => 
                        n.id === selectedNode.id 
                          ? { ...n, data: { ...n.data, condition: e.target.value } }
                          : n
                      );
                      setNodes(updatedNodes);
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, condition: e.target.value } });
                    }}
                    className="bg-[#2A2A2E] border-[#FF6A00]/30 text-white"
                    placeholder="e.g., input.body contains 'help'"
                  />
                </div>
              )}

              {selectedNode.type === 'ai_response' && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-white text-xs">AI Prompt</Label>
                    <Textarea 
                      value={selectedNode.data.message || ''}
                      onChange={(e) => {
                        const updatedNodes = nodes.map(n => 
                          n.id === selectedNode.id 
                            ? { ...n, data: { ...n.data, message: e.target.value } }
                            : n
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, message: e.target.value } });
                      }}
                      className="bg-[#2A2A2E] border-[#8A2BE2]/30 text-white"
                      placeholder="AI instruction for handling customer interaction"
                      rows={4}
                    />
                  </div>
                  <div className="p-3 bg-[#8A2BE2]/20 border border-[#8A2BE2]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-[#8A2BE2]" />
                      <span className="text-xs font-bold text-[#8A2BE2]">AI CAPABILITIES</span>
                    </div>
                    <ul className="text-xs text-white space-y-1">
                      <li>• Intent Recognition</li>
                      <li>• Sentiment Analysis</li>
                      <li>• Dynamic Responses</li>
                      <li>• Context Awareness</li>
                    </ul>
                  </div>
                </div>
              )}

              <Button 
                onClick={() => {
                  setNodes(nodes.filter(n => n.id !== selectedNode.id));
                  setSelectedNode(null);
                }}
                variant="destructive"
                className="w-full"
              >
                Delete Node
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
