import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MapSettings {
  refreshRate: number;
  visibilityRange: number;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  showTraffic: boolean;
  showTransit: boolean;
  showBicycling: boolean;
  gestureHandling: 'cooperative' | 'greedy' | 'none' | 'auto';
  zoomControl: boolean;
  mapTypeControl: boolean;
  streetViewControl: boolean;
  fullscreenControl: boolean;
  scaleControl: boolean;
  rotateControl: boolean;
  minZoom: number;
  maxZoom: number;
  enableClustering: boolean;
}

interface MapSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: MapSettings) => void;
  currentSettings: MapSettings;
}

export default function MapSettingsDialog({
  open,
  onClose,
  onSave,
  currentSettings,
}: MapSettingsDialogProps) {
  const [settings, setSettings] = useState<MapSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, open]);

  const handleSave = () => {
    onSave(settings);
  };

  const handleReset = () => {
    setSettings({
      refreshRate: 5,
      visibilityRange: 0,
      mapType: 'roadmap',
      showTraffic: false,
      showTransit: false,
      showBicycling: false,
      gestureHandling: 'greedy',
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      scaleControl: false,
      rotateControl: false,
      minZoom: 3,
      maxZoom: 21,
      enableClustering: true,
    });
  };

  const updateSetting = <K extends keyof MapSettings>(
    key: K,
    value: MapSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Map Settings</DialogTitle>
          <DialogDescription>
            Configure all map display and behavior settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="refreshRate" className="text-sm font-medium">
                  Refresh Rate
                </Label>
                <span className="text-sm text-gray-500">
                  {settings.refreshRate} seconds
                </span>
              </div>
              <Slider
                id="refreshRate"
                min={1}
                max={60}
                step={1}
                value={[settings.refreshRate]}
                onValueChange={(value) =>
                  updateSetting('refreshRate', value[0])
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                How often to update traffic light data (1-60 seconds)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="visibilityRange"
                  className="text-sm font-medium"
                >
                  Visibility Range
                </Label>
                <span className="text-sm text-gray-500">
                  {settings.visibilityRange === 0
                    ? 'All'
                    : `${settings.visibilityRange}m`}
                </span>
              </div>
              <Slider
                id="visibilityRange"
                min={0}
                max={5000}
                step={100}
                value={[settings.visibilityRange]}
                onValueChange={(value) =>
                  updateSetting('visibilityRange', value[0])
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Show traffic lights within range from your location (0 = show
                all)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="enableClustering"
                  className="text-sm font-medium"
                >
                  Enable Marker Clustering
                </Label>
                <p className="text-xs text-gray-500">
                  Group nearby markers into clusters for better performance
                </p>
              </div>
              <Switch
                id="enableClustering"
                checked={settings.enableClustering}
                onCheckedChange={(checked) =>
                  updateSetting('enableClustering', checked)
                }
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="mapType" className="text-sm font-medium">
                Map Type
              </Label>
              <Select
                value={settings.mapType}
                onValueChange={(value: any) => updateSetting('mapType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select map type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roadmap">Roadmap</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Choose the base map display style
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="gestureHandling" className="text-sm font-medium">
                Gesture Handling
              </Label>
              <Select
                value={settings.gestureHandling}
                onValueChange={(value: any) =>
                  updateSetting('gestureHandling', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gesture handling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greedy">Greedy (always pan)</SelectItem>
                  <SelectItem value="cooperative">
                    Cooperative (Ctrl+scroll to zoom)
                  </SelectItem>
                  <SelectItem value="none">None (disable gestures)</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Control how map responds to user interactions
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minZoom" className="text-xs">
                  Min Zoom (3-21)
                </Label>
                <Input
                  id="minZoom"
                  type="number"
                  min={3}
                  max={21}
                  value={settings.minZoom}
                  onChange={(e) =>
                    updateSetting(
                      'minZoom',
                      Math.max(3, Math.min(21, Number(e.target.value)))
                    )
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxZoom" className="text-xs">
                  Max Zoom (3-21)
                </Label>
                <Input
                  id="maxZoom"
                  type="number"
                  min={3}
                  max={21}
                  value={settings.maxZoom}
                  onChange={(e) =>
                    updateSetting(
                      'maxZoom',
                      Math.max(3, Math.min(21, Number(e.target.value)))
                    )
                  }
                  className="h-9"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layers" className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showTraffic" className="text-sm font-medium">
                  Traffic Layer
                </Label>
                <p className="text-xs text-gray-500">
                  Display real-time traffic conditions
                </p>
              </div>
              <Switch
                id="showTraffic"
                checked={settings.showTraffic}
                onCheckedChange={(checked) =>
                  updateSetting('showTraffic', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showTransit" className="text-sm font-medium">
                  Transit Layer
                </Label>
                <p className="text-xs text-gray-500">
                  Show public transportation routes
                </p>
              </div>
              <Switch
                id="showTransit"
                checked={settings.showTransit}
                onCheckedChange={(checked) =>
                  updateSetting('showTransit', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showBicycling" className="text-sm font-medium">
                  Bicycling Layer
                </Label>
                <p className="text-xs text-gray-500">
                  Display bike lanes and paths
                </p>
              </div>
              <Switch
                id="showBicycling"
                checked={settings.showBicycling}
                onCheckedChange={(checked) =>
                  updateSetting('showBicycling', checked)
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="zoomControl" className="text-sm font-medium">
                  Zoom Control
                </Label>
                <p className="text-xs text-gray-500">Show +/- zoom buttons</p>
              </div>
              <Switch
                id="zoomControl"
                checked={settings.zoomControl}
                onCheckedChange={(checked) =>
                  updateSetting('zoomControl', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mapTypeControl" className="text-sm font-medium">
                  Map Type Control
                </Label>
                <p className="text-xs text-gray-500">Show map type selector</p>
              </div>
              <Switch
                id="mapTypeControl"
                checked={settings.mapTypeControl}
                onCheckedChange={(checked) =>
                  updateSetting('mapTypeControl', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="streetViewControl"
                  className="text-sm font-medium"
                >
                  Street View Control
                </Label>
                <p className="text-xs text-gray-500">Show street view pegman</p>
              </div>
              <Switch
                id="streetViewControl"
                checked={settings.streetViewControl}
                onCheckedChange={(checked) =>
                  updateSetting('streetViewControl', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="fullscreenControl"
                  className="text-sm font-medium"
                >
                  Fullscreen Control
                </Label>
                <p className="text-xs text-gray-500">Show fullscreen button</p>
              </div>
              <Switch
                id="fullscreenControl"
                checked={settings.fullscreenControl}
                onCheckedChange={(checked) =>
                  updateSetting('fullscreenControl', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="scaleControl" className="text-sm font-medium">
                  Scale Control
                </Label>
                <p className="text-xs text-gray-500">
                  Show map scale indicator
                </p>
              </div>
              <Switch
                id="scaleControl"
                checked={settings.scaleControl}
                onCheckedChange={(checked) =>
                  updateSetting('scaleControl', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="rotateControl" className="text-sm font-medium">
                  Rotate Control
                </Label>
                <p className="text-xs text-gray-500">
                  Show rotate/tilt buttons
                </p>
              </div>
              <Switch
                id="rotateControl"
                checked={settings.rotateControl}
                onCheckedChange={(checked) =>
                  updateSetting('rotateControl', checked)
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
