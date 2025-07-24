import React, { useState, useEffect } from "react";
import { COMPREHENSIVE_THEMES, type ComprehensiveTheme } from "@/data/comprehensive-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Palette,
  Monitor,
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Save,
  Paintbrush,
  Zap,
  Moon,
  Sun,
  Contrast,
  Grid3X3,
  Settings,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    scale: number;
    radius: number;
  };
  effects: {
    shadows: boolean;
    gradients: boolean;
    blur: boolean;
    animations: boolean;
  };
}

const DEFAULT_THEMES: ThemeConfig[] = [
  {
    id: "fortune10",
    name: "Fortune 10 Command",
    description: "Executive-grade design with Tesla/Palantir aesthetics",
    colors: {
      primary: "#FFD700",
      secondary: "#00E676", 
      accent: "#00BFFF",
      background: "#111111",
      surface: "#1a1a1a",
      text: "#ffffff",
      muted: "#737373"
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      mono: "JetBrains Mono"
    },
    spacing: {
      scale: 1.0,
      radius: 8
    },
    effects: {
      shadows: true,
      gradients: true,
      blur: true,
      animations: true
    }
  },
  {
    id: "velocify",
    name: "Velocify Blue",
    description: "Professional client operations theme",
    colors: {
      primary: "#00BFFF",
      secondary: "#0099CC",
      accent: "#FFD700",
      background: "#0a0a0a",
      surface: "#1a1a1a",
      text: "#ffffff",
      muted: "#6b7280"
    },
    fonts: {
      heading: "Inter",
      body: "Inter", 
      mono: "JetBrains Mono"
    },
    spacing: {
      scale: 1.0,
      radius: 6
    },
    effects: {
      shadows: true,
      gradients: true,
      blur: false,
      animations: true
    }
  },
  {
    id: "firestorm",
    name: "FIRESTORM Orange",
    description: "High-energy marketing automation theme",
    colors: {
      primary: "#FF6A00",
      secondary: "#FF8533",
      accent: "#FFD700",
      background: "#0f0f0f",
      surface: "#1a1a1a",
      text: "#ffffff",
      muted: "#737373"
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      mono: "JetBrains Mono"
    },
    spacing: {
      scale: 1.0,
      radius: 10
    },
    effects: {
      shadows: true,
      gradients: true,
      blur: true,
      animations: true
    }
  },
  {
    id: "dream-portal",
    name: "Dream Portal Purple",
    description: "Elegant member management theme",
    colors: {
      primary: "#8A2BE2",
      secondary: "#9932CC",
      accent: "#FFD700",
      background: "#0d0d0d",
      surface: "#1a1a1a",
      text: "#ffffff",
      muted: "#737373"
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      mono: "JetBrains Mono"
    },
    spacing: {
      scale: 1.0,
      radius: 12
    },
    effects: {
      shadows: true,
      gradients: true,
      blur: true,
      animations: true
    }
  }
];

export default function SkinCustomizer() {
  const [selectedTheme, setSelectedTheme] = useState<ComprehensiveTheme>(COMPREHENSIVE_THEMES[0]);
  const [customTheme, setCustomTheme] = useState<ComprehensiveTheme>(COMPREHENSIVE_THEMES[0]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isApplying, setIsApplying] = useState(false);
  const [currentTab, setCurrentTab] = useState("themes");

  useEffect(() => {
    try {
      setCustomTheme(selectedTheme);
    } catch (error) {
      console.error('Error setting custom theme:', error);
    }
  }, [selectedTheme]);

  const applyTheme = async (theme: ThemeConfig) => {
    setIsApplying(true);
    try {
      // Apply CSS custom properties to root
      const root = document.documentElement;
      root.style.setProperty('--primary-color', theme.colors.primary);
      root.style.setProperty('--secondary-color', theme.colors.secondary);
      root.style.setProperty('--accent-color', theme.colors.accent);
      root.style.setProperty('--background-color', theme.colors.background);
      root.style.setProperty('--surface-color', theme.colors.surface);
      root.style.setProperty('--text-color', theme.colors.text);
      root.style.setProperty('--muted-color', theme.colors.muted);
      root.style.setProperty('--border-radius', `${theme.spacing.radius}px`);
      root.style.setProperty('--spacing-scale', theme.spacing.scale.toString());

      // Save to localStorage
      localStorage.setItem('ecelonx-theme', JSON.stringify(theme));
      
      console.log(`✅ Applied theme: ${theme.name}`);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const exportTheme = () => {
    const dataStr = JSON.stringify(customTheme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${customTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const updateCustomThemeColor = (colorKey: keyof ComprehensiveTheme['colors'], value: string) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  return (
    <Card className="f10-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#FFD700]" />
          ECELONX Skin Customizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview Mode Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-[#b3b3b3]">Preview Mode:</Label>
            <div className="flex gap-1">
              {[
                { mode: 'desktop', icon: Monitor },
                { mode: 'tablet', icon: Grid3X3 },
                { mode: 'mobile', icon: Smartphone }
              ].map(({ mode, icon: Icon }) => (
                <Button
                  key={mode}
                  variant={previewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode(mode as typeof previewMode)}
                  className="f10-btn"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => applyTheme(customTheme)}
              disabled={isApplying}
              className="f10-btn accent-bg text-black"
            >
              {isApplying ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Apply Live
            </Button>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 glass-card corp-shadow">
            <TabsTrigger value="themes" className="gap-2">
              <Palette className="w-4 h-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-2">
              <Paintbrush className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="layout" className="gap-2">
              <Settings className="w-4 h-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Preset Themes */}
          <TabsContent value="themes" className="space-y-4">
            <div className="mb-4">
              <h4 className="font-semibold text-white mb-2">🎨 {COMPREHENSIVE_THEMES.length} Professional Themes Available</h4>
              <p className="text-sm text-[#b3b3b3]">Choose from Executive Command, Velocify Ops, FIRESTORM, Dream Portal, Nexus Sync, Zero-CB Fortress, Creative, Minimal, Futuristic, and Luxury categories</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {COMPREHENSIVE_THEMES.map((theme) => (
                <Card
                  key={theme.id}
                  className={cn(
                    "cursor-pointer transition-all border-2 hover:scale-105",
                    selectedTheme.id === theme.id 
                      ? "border-[#FFD700] bg-[#FFD700]/10" 
                      : "border-[#333333] hover:border-[#FFD700]/50"
                  )}
                  onClick={() => setSelectedTheme(theme)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className="bg-[#333333] text-[#b3b3b3] border-[#444444] text-xs">
                        {theme.category}
                      </Badge>
                      {selectedTheme.id === theme.id && (
                        <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/40 text-xs">
                          SELECTED
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm font-semibold text-white">
                      {theme.name}
                    </CardTitle>
                    <p className="text-xs text-[#b3b3b3] line-clamp-2">{theme.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      {Object.entries(theme.colors).slice(0, 5).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-6 h-6 rounded-full border border-[#333333]"
                          style={{ backgroundColor: color }}
                          title={`${key}: ${color}`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-[#b3b3b3]">
                        Font: {theme.fonts.heading}
                      </div>
                      <div className="text-[#b3b3b3]">
                        Radius: {theme.spacing.radius}px
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Color Customization */}
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(customTheme.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-[#b3b3b3] capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => updateCustomThemeColor(key as keyof ThemeConfig['colors'], e.target.value)}
                      className="w-16 h-10 p-1 border border-[#333333] bg-[#0a0a0a]"
                    />
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => updateCustomThemeColor(key as keyof ThemeConfig['colors'], e.target.value)}
                      className="flex-1 bg-[#0a0a0a] border-[#333333] text-white"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Color Preview</h4>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(customTheme.colors).map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-full h-12 rounded border border-[#333333] mb-1"
                      style={{ backgroundColor: color }}
                    />
                    <div className="text-xs text-[#b3b3b3] capitalize">
                      {key}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Layout Settings */}
          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Spacing & Layout</h4>
                
                <div className="space-y-2">
                  <Label className="text-[#b3b3b3]">Border Radius: {customTheme.spacing.radius}px</Label>
                  <input
                    type="range"
                    value={customTheme.spacing.radius}
                    onChange={(e) => setCustomTheme(prev => ({
                      ...prev,
                      spacing: { ...prev.spacing, radius: parseInt(e.target.value) }
                    }))}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#b3b3b3]">Spacing Scale: {customTheme.spacing.scale}x</Label>
                  <input
                    type="range"
                    value={customTheme.spacing.scale}
                    onChange={(e) => setCustomTheme(prev => ({
                      ...prev,
                      spacing: { ...prev.spacing, scale: parseFloat(e.target.value) }
                    }))}
                    max={1.5}
                    min={0.8}
                    step={0.1}
                    className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Visual Effects</h4>
                
                {Object.entries(customTheme.effects).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-[#b3b3b3] capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </Label>
                    <Button
                      variant={enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCustomTheme(prev => ({
                        ...prev,
                        effects: {
                          ...prev.effects,
                          [key]: !enabled
                        }
                      }))}
                      className="f10-btn"
                    >
                      {enabled ? "ON" : "OFF"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Live Preview */}
          <TabsContent value="preview" className="space-y-4">
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
              <h4 className="font-semibold text-white mb-4">Live Theme Preview</h4>
              
              {/* Preview Components */}
              <div className="space-y-4" style={{
                '--preview-primary': customTheme.colors.primary,
                '--preview-secondary': customTheme.colors.secondary,
                '--preview-accent': customTheme.colors.accent,
                '--preview-background': customTheme.colors.background,
                '--preview-surface': customTheme.colors.surface,
                '--preview-text': customTheme.colors.text,
                '--preview-muted': customTheme.colors.muted,
                '--preview-radius': `${customTheme.spacing.radius}px`
              } as React.CSSProperties}>
                
                {/* Sample Button */}
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 rounded font-medium"
                    style={{
                      backgroundColor: customTheme.colors.primary,
                      color: customTheme.colors.background,
                      borderRadius: `${customTheme.spacing.radius}px`
                    }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="px-4 py-2 rounded font-medium border"
                    style={{
                      backgroundColor: 'transparent',
                      color: customTheme.colors.primary,
                      borderColor: customTheme.colors.primary,
                      borderRadius: `${customTheme.spacing.radius}px`
                    }}
                  >
                    Secondary Button
                  </button>
                </div>

                {/* Sample Card */}
                <div 
                  className="p-4 border"
                  style={{
                    backgroundColor: customTheme.colors.surface,
                    borderColor: '#333333',
                    borderRadius: `${customTheme.spacing.radius}px`
                  }}
                >
                  <h5 className="font-semibold mb-2" style={{ color: customTheme.colors.text }}>
                    Sample Card
                  </h5>
                  <p className="text-sm" style={{ color: customTheme.colors.muted }}>
                    This is how your theme will look with cards and content.
                  </p>
                  <div 
                    className="mt-2 px-2 py-1 text-xs rounded"
                    style={{
                      backgroundColor: `${customTheme.colors.accent}20`,
                      color: customTheme.colors.accent,
                      borderRadius: `${customTheme.spacing.radius * 0.5}px`
                    }}
                  >
                    Badge Example
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={exportTheme}
                className="f10-btn f10-btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Theme
              </Button>
              <Button
                onClick={() => applyTheme(customTheme)}
                disabled={isApplying}
                className="f10-btn accent-bg text-black"
              >
                {isApplying ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save & Apply
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
