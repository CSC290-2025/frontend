import { Button } from '@/components/ui/button';
import { useNavigate } from '@/router';
import { Kbd } from '@/components/ui/kbd';
import { ArrowBigUpIcon, CommandIcon } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-lg space-y-6 px-6 text-center">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-800">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            Page Not Found
          </h2>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <p>The page you are looking for does not exist or has been moved.</p>
          <div className="rounded-lg bg-gray-50 p-4 text-left text-xs leading-relaxed">
            <p className="mb-3 font-semibold">
              If you are sure this is an error, please try clearing your browser
              cache:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Windows/Linux:</span>
                <Kbd>Ctrl</Kbd>
                <span>+</span>
                <Kbd>
                  Shift <ArrowBigUpIcon className="ml-1.5 size-3.5" />
                </Kbd>
                <span>+</span>
                <Kbd>R</Kbd>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Mac:</span>
                <Kbd>
                  Cmd <CommandIcon className="ml-1.5 size-3.5" />
                </Kbd>
                <span>+</span>
                <Kbd>
                  Shift <ArrowBigUpIcon className="ml-1.5 size-3.5" />
                </Kbd>
                <span>+</span>
                <Kbd>R</Kbd>
              </div>
              <div className="mt-3">
                <span className="font-semibold">Other browsers:</span> Check
                your browser&#39;s settings for cache clearing options
              </div>
            </div>
          </div>
        </div>

        <Button onClick={() => navigate('/')} variant="default">
          Go to Home
        </Button>
      </div>
    </div>
  );
}
