import { useState, useEffect } from 'preact/hooks';
import Button from './Button';
import { migrateLocalDataToApi, clearLocalStorageData } from '../../utils/dataMigration';
import { api } from '../../utils/api';

export default function MigrationBanner() {
  const [hasLocalData, setHasLocalData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  // Check if there's local data to migrate
  useEffect(() => {
    const promptsData = localStorage.getItem('prompts');
    setHasLocalData(!!promptsData);
  }, []);

  // Don't show the banner if there's no data to migrate
  if (!hasLocalData || !showBanner) return null;

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateLocalDataToApi(api);
      setMigrationResult(result);
      
      // If migration was successful, clear the localStorage data
      if (result.success && result.migrated) {
        clearLocalStorageData(true);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationResult({
        success: false,
        message: `Migration failed: ${error.message}`
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  return (
    <div className="migration-banner" style={{ 
      margin: '1rem 0 2rem', 
      padding: '1rem', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '0.5rem',
      border: '1px solid #dee2e6' 
    }}>
      <div className="banner-content">
        <h3 style={{ marginTop: 0 }}>
          {migrationResult ? 
            (migrationResult.success ? '✅ Migration Complete' : '❌ Migration Failed') : 
            '🔄 Local Data Detected'}
        </h3>
        
        {!migrationResult ? (
          <p>
            You have prompts and responses stored locally in your browser. 
            Would you like to migrate this data to your account?
          </p>
        ) : (
          <p>
            {migrationResult.message}
          </p>
        )}
        
        {migrationResult && migrationResult.success && migrationResult.stats && (
          <div style={{ margin: '1rem 0', fontSize: '0.9rem' }}>
            <p>
              <strong>Prompts:</strong> {migrationResult.stats.prompts.migrated}/{migrationResult.stats.prompts.total} migrated
              {migrationResult.stats.prompts.failed > 0 && ` (${migrationResult.stats.prompts.failed} failed)`}
            </p>
            <p>
              <strong>Responses:</strong> {migrationResult.stats.responses.migrated}/{migrationResult.stats.responses.total} migrated
              {migrationResult.stats.responses.failed > 0 && ` (${migrationResult.stats.responses.failed} failed)`}
            </p>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
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
            <Button variant={migrationResult.success ? 'outline' : 'primary'} onClick={dismissBanner}>
              {migrationResult.success ? 'Dismiss' : 'Close'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}