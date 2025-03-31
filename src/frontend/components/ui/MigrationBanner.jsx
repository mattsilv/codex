import { useState } from 'preact/hooks';
import { migrateLegacyData, hasLegacyData } from '../../utils/migrateLegacyData';
import Button from './Button';

export default function MigrationBanner() {
  const [isVisible, setIsVisible] = useState(hasLegacyData());
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState(null);
  
  if (!isVisible) return null;
  
  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const migrationResult = await migrateLegacyData();
      setResult(migrationResult);
      
      if (migrationResult.success) {
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.message || 'Migration failed'
      });
    } finally {
      setIsMigrating(false);
    }
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  return (
    <div className="migration-banner" role="alert">
      <div>
        <strong>Local Data Detected</strong>
        <p>
          We found prompts and responses stored on your device. Would you like to migrate them to your account?
        </p>
        {result && (
          <p className={result.success ? 'success' : 'error'}>
            {result.message}
          </p>
        )}
      </div>
      <div className="migration-actions">
        <Button 
          onClick={handleMigrate} 
          disabled={isMigrating}
          aria-busy={isMigrating}
        >
          {isMigrating ? 'Migrating...' : 'Migrate Data'}
        </Button>
        <Button 
          onClick={handleDismiss}
          variant="secondary"
          disabled={isMigrating}
        >
          Dismiss
        </Button>
      </div>
      
      <style jsx>{`
        .migration-banner {
          background-color: var(--card-background-color);
          border-radius: var(--border-radius);
          padding: 1rem;
          margin-bottom: 1rem;
          border-left: 5px solid var(--primary);
        }
        
        .migration-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .success {
          color: var(--form-element-valid-border-color);
        }
        
        .error {
          color: var(--form-element-invalid-border-color);
        }
      `}</style>
    </div>
  );
}