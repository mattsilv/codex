import { h, JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Button from './Button';
import {
  migrateLegacyData,
  clearLocalStorageData,
  hasLegacyData,
  getMigrationLogs,
} from '../../utils/migrateLegacyData';
import { STORAGE_KEYS } from '@shared/constants';
import useToast from '../../hooks/useToast';

interface MigrationStats {
  prompts: {
    total: number;
    migrated: number;
    failed: number;
  };
  responses: {
    total: number;
    migrated: number;
    failed: number;
  };
}

interface MigrationResult {
  success: boolean;
  migrated?: boolean;
  message: string;
  stats?: MigrationStats;
  logs?: string[];
}

export default function MigrationBanner(): JSX.Element | null {
  const { showSuccess, showError, showWarning } = useToast();
  const [hasLocalData, setHasLocalData] = useState<boolean>(false);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [migrationResult, setMigrationResult] =
    useState<MigrationResult | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Check if there's local data to migrate
  useEffect(() => {
    // Check if the user has already dismissed the banner
    const dismissed =
      localStorage.getItem(`${STORAGE_KEYS.PROMPTS}_migration_dismissed`) ===
      'true';

    if (dismissed) {
      setShowBanner(false);
    } else {
      const hasData = hasLegacyData();
      setHasLocalData(hasData);
      setShowBanner(hasData);
    }
  }, []);

  // Don't show the banner if there's no data to migrate or if it's been dismissed
  if (!hasLocalData || !showBanner) return null;

  const handleMigrate = async (): Promise<void> => {
    setIsMigrating(true);
    try {
      const result = await migrateLegacyData();
      setMigrationResult(result);

      // Show appropriate toast notification based on migration result
      if (result.success && result.migrated) {
        showSuccess(
          `Successfully migrated data to your account. ${result.stats?.prompts.migrated || 0} prompts and ${result.stats?.responses.migrated || 0} responses migrated.`
        );

        // If migration was successful, clear the localStorage data
        clearLocalStorageData(true);
      } else if (result.success && !result.migrated) {
        showWarning('No data to migrate. Your account is up to date.');
      } else if (!result.success) {
        showError(`Migration failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      const errorMessage = `Migration failed: ${(error as Error).message}`;

      setMigrationResult({
        success: false,
        message: errorMessage,
      });

      showError(errorMessage);
    } finally {
      setIsMigrating(false);
    }
  };

  const dismissBanner = (): void => {
    setShowBanner(false);
    // Remember that user dismissed the banner
    localStorage.setItem(`${STORAGE_KEYS.PROMPTS}_migration_dismissed`, 'true');
  };

  const toggleLogs = (): void => {
    setShowLogs(!showLogs);
  };

  return (
    <div className="my-4 mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
      <div>
        <h3 className="text-lg font-medium mt-0 mb-2">
          {migrationResult
            ? migrationResult.success
              ? '✅ Migration Complete'
              : '❌ Migration Failed'
            : '🔄 Local Data Detected'}
        </h3>

        {!migrationResult ? (
          <p className="text-gray-700">
            You have prompts and responses stored locally in your browser. Would
            you like to migrate this data to your account?
          </p>
        ) : (
          <p className="text-gray-700">{migrationResult.message}</p>
        )}

        {migrationResult &&
          migrationResult.success &&
          migrationResult.stats && (
            <div className="my-4 text-sm">
              <p className="mb-1">
                <span className="font-semibold">Prompts:</span>{' '}
                {migrationResult.stats.prompts.migrated}/
                {migrationResult.stats.prompts.total} migrated
                {migrationResult.stats.prompts.failed > 0 && (
                  <span className="text-red-600">
                    {' '}
                    ({migrationResult.stats.prompts.failed} failed)
                  </span>
                )}
              </p>
              <p>
                <span className="font-semibold">Responses:</span>{' '}
                {migrationResult.stats.responses.migrated}/
                {migrationResult.stats.responses.total} migrated
                {migrationResult.stats.responses.failed > 0 && (
                  <span className="text-red-600">
                    {' '}
                    ({migrationResult.stats.responses.failed} failed)
                  </span>
                )}
              </p>
            </div>
          )}

        {/* Migration logs section (hidden by default) */}
        {migrationResult && migrationResult.logs && showLogs && (
          <div className="my-4 bg-gray-100 p-3 rounded-md text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto">
            {migrationResult.logs.map((log, index) => (
              <div
                key={index}
                className={`
                ${log.includes('[ERROR]') ? 'text-red-600' : ''}
                ${log.includes('[WARNING]') ? 'text-yellow-600' : ''}
                ${log.includes('[SUCCESS]') ? 'text-green-600' : ''}
              `}
              >
                {log}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4 flex-wrap">
          {!migrationResult ? (
            <>
              <Button onClick={handleMigrate} disabled={isMigrating}>
                {isMigrating ? 'Migrating...' : 'Migrate Data'}
              </Button>
              <Button variant="outline" onClick={dismissBanner}>
                Dismiss
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={migrationResult.success ? 'outline' : 'primary'}
                onClick={dismissBanner}
              >
                {migrationResult.success ? 'Dismiss' : 'Close'}
              </Button>

              {migrationResult.logs && migrationResult.logs.length > 0 && (
                <Button variant="secondary" onClick={toggleLogs}>
                  {showLogs ? 'Hide Details' : 'Show Details'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
