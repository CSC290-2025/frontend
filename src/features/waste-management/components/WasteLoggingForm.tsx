import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2 } from 'lucide-react';
import { useWasteTypes, useLogWaste } from '@/features/waste-management/hooks';

export default function WasteLoggingForm() {
  const [wasteType, setWasteType] = useState('');
  const [weight, setWeight] = useState('');
  const [customType, setCustomType] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState({ type: '', weight: '' });

  const { data: wasteTypesData, isLoading } = useWasteTypes();
  const logWasteMutation = useLogWaste();

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (logWasteMutation.isSuccess) {
      setShowSuccess(true);
      setIsAnimatingOut(false);

      const timer = setTimeout(() => {
        setIsAnimatingOut(true);

        // Wait for animation to complete before hiding
        setTimeout(() => {
          setShowSuccess(false);
          logWasteMutation.reset();
        }, 300); // Match the animation duration
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [logWasteMutation.isSuccess]);

  const handleSubmit = () => {
    const finalType = wasteType === 'custom' ? customType : wasteType;
    if (finalType && weight) {
      setLastSubmitted({ type: finalType, weight });

      logWasteMutation.mutate(
        {
          waste_type_name: finalType,
          weight: parseFloat(weight),
        },
        {
          onSuccess: () => {
            setWasteType('');
            setWeight('');
            setCustomType('');
          },
        }
      );
    }
  };

  return (
    <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trash2 className="h-6 w-6 text-purple-600" />
          Log Waste
        </CardTitle>
        <CardDescription className="text-base">
          Record your waste collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-base font-medium">
              Waste Type
            </label>
            <Select
              value={wasteType}
              onValueChange={setWasteType}
              disabled={isLoading}
            >
              <SelectTrigger className="h-11 border-green-200 text-base focus:ring-green-500">
                <SelectValue
                  placeholder={isLoading ? 'Loading...' : 'Select waste type'}
                />
              </SelectTrigger>
              <SelectContent>
                {wasteTypesData?.wasteTypes &&
                  wasteTypesData?.wasteTypes.map((type) => (
                    <SelectItem
                      key={type.id}
                      value={type.type_name}
                      className="text-base"
                    >
                      {type.type_name}{' '}
                      {type.typical_weight_kg &&
                        `(${type.typical_weight_kg}kg typical)`}
                    </SelectItem>
                  ))}
                <SelectItem value="custom" className="text-base">
                  + Add Custom Type
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: wasteType === 'custom' ? '200px' : '0px',
              opacity: wasteType === 'custom' ? 1 : 0,
            }}
          >
            <div>
              <label className="mb-2 block text-base font-medium">
                Custom Waste Type
              </label>
              <Input
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter waste type name"
                className="h-11 border-purple-200 text-base focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-base font-medium">
              Weight (kg)
            </label>
            <Input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="h-11 border-purple-200 text-base focus:ring-purple-500"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={logWasteMutation.isPending || !wasteType || !weight}
            className="h-11 w-full bg-linear-to-r from-green-600 to-green-600 text-base hover:from-green-700 hover:to-green-700"
          >
            {logWasteMutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>

        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight:
              showSuccess || logWasteMutation.isError ? '200px' : '0px',
            marginTop: showSuccess || logWasteMutation.isError ? '1rem' : '0px',
          }}
        >
          {showSuccess && (
            <Alert
              className={`border-green-200 bg-green-50 transition-all duration-300 ease-in-out ${
                isAnimatingOut
                  ? 'translate-y-2 opacity-0'
                  : 'translate-y-0 opacity-100'
              }`}
            >
              <AlertDescription className="text-base text-green-800">
                Logged {lastSubmitted.weight}kg of {lastSubmitted.type} waste ✓
              </AlertDescription>
            </Alert>
          )}

          {logWasteMutation.isError && (
            <Alert className="animate-in fade-in slide-in-from-top-2 border-red-200 bg-red-50 duration-300">
              <AlertDescription className="text-base text-red-800">
                Failed to log waste. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
