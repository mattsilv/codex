import { useState, useEffect } from 'preact/hooks';
import Button from './Button';
import {
  migrateLegacyData,
  clearLocalStorageData,
  hasLegacyData,
} from '../../utils/migrateLegacyData';
import { STORAGE_KEYS } from '@shared/constants';

export default function MigrationBanner() {
  const [hasLocalData, setHasLocalData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  // Check if there's local data to migrate
  useEffect(() => {
    setHasLocalData(hasLegacyData());
  }, []);

  // Don't show the banner if there's no data to migrate
  if (!hasLocalData || !showBanner) return null;

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateLegacyData();
      setMigrationResult(result);

      // If migration was successful, clear the localStorage data
      if (result.success && result.migrated) {
        clearLocalStorageData(true);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationResult({
        success: false,
        message: `Migration failed: ${error.message}`,
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    // Remember that user dismissed the banner
    localStorage.setItem(`${STORAGE_KEYS.PROMPTS}_migration_dismissed`, 'true');
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

        <div className="flex gap-2 mt-4">
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
            <Button
              variant={migrationResult.success ? 'outline' : 'primary'}
              onClick={dismissBanner}
            >
              {migrationResult.success ? 'Dismiss' : 'Close'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
