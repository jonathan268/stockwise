import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Loader2, AlertCircle } from 'lucide-react';
import Modal from '../Modal';
import { AlertService } from '../../../services/alertService';
import toast from 'react-hot-toast';

const AlertSettingsModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [settings, setSettings] = useState({
    channels: {
      inApp: true,
      email: true,
      push: false,
      sms: false
    },
    alerts: {
      lowStock: {
        enabled: true,
        channels: ['inApp', 'email'],
        threshold: 20
      },
      outOfStock: {
        enabled: true,
        channels: ['inApp', 'email', 'push'],
        threshold: 0
      },
      expiringProducts: {
        enabled: true,
        channels: ['inApp', 'email'],
        daysBeforeExpiry: 7
      },
      newOrders: {
        enabled: true,
        channels: ['inApp']
      },
      orderStatus: {
        enabled: true,
        channels: ['inApp', 'email']
      },
      paymentDue: {
        enabled: true,
        channels: ['inApp', 'email'],
        daysBefore: 3
      },
      aiInsights: {
        enabled: true,
        channels: ['inApp']
      },
      anomalies: {
        enabled: true,
        channels: ['inApp', 'email']
      }
    },
    schedule: {
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00'
    },
    digest: {
      enabled: false,
      frequency: 'daily',
      time: '09:00'
    }
  });

  // ==================== LOAD SETTINGS ====================
  useEffect(() => {
    const loadSettings = async () => {
      if (!isOpen) return;

      try {
        setLoadingSettings(true);
        const response = await AlertService.getNotificationSettings();

        if (response.success && response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error('Erreur chargement paramètres:', err);
        toast.error('Erreur lors du chargement des paramètres');
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, [isOpen]);

  // ==================== HANDLE CHANGE ====================
  const handleChannelChange = (channel) => {
    setSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel]
      }
    }));
  };

  const handleAlertChange = (alertType, field, value) => {
    setSettings(prev => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        [alertType]: {
          ...prev.alerts[alertType],
          [field]: value
        }
      }
    }));
  };

  const handleAlertChannelToggle = (alertType, channel) => {
    setSettings(prev => {
      const currentChannels = prev.alerts[alertType].channels || [];
      const newChannels = currentChannels.includes(channel)
        ? currentChannels.filter(c => c !== channel)
        : [...currentChannels, channel];

      return {
        ...prev,
        alerts: {
          ...prev.alerts,
          [alertType]: {
            ...prev.alerts[alertType],
            channels: newChannels
          }
        }
      };
    });
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await AlertService.updateNotificationSettings(settings);
      toast.success('Paramètres enregistrés avec succès');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Erreur sauvegarde paramètres:', err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Chargement...">
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Paramètres des notifications"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Canaux globaux */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg border-b pb-2">Canaux de notification</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-base-200">
              <input
                type="checkbox"
                checked={settings.channels.inApp}
                onChange={() => handleChannelChange('inApp')}
                className="checkbox checkbox-primary"
              />
              <span className="font-medium">Notifications in-app</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-base-200">
              <input
                type="checkbox"
                checked={settings.channels.email}
                onChange={() => handleChannelChange('email')}
                className="checkbox checkbox-primary"
              />
              <span className="font-medium">Email</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-base-200">
              <input
                type="checkbox"
                checked={settings.channels.push}
                onChange={() => handleChannelChange('push')}
                className="checkbox checkbox-primary"
              />
              <span className="font-medium">Notifications push</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-base-200">
              <input
                type="checkbox"
                checked={settings.channels.sms}
                onChange={() => handleChannelChange('sms')}
                className="checkbox checkbox-primary"
              />
              <span className="font-medium">SMS</span>
            </label>
          </div>
        </div>

        {/* Types d'alertes */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg border-b pb-2">Types d'alertes</h4>

          {/* Stock bas */}
          <div className="card bg-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alerts.lowStock.enabled}
                    onChange={(e) => handleAlertChange('lowStock', 'enabled', e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                  <span className="font-semibold">Stock bas</span>
                </label>
              </div>

              {settings.alerts.lowStock.enabled && (
                <div className="space-y-3 ml-8">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Seuil d'alerte (%)</span>
                    </label>
                    <input
                      type="number"
                      value={settings.alerts.lowStock.threshold}
                      onChange={(e) => handleAlertChange('lowStock', 'threshold', parseInt(e.target.value))}
                      className="input input-bordered input-sm w-32"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['inApp', 'email', 'push', 'sms'].map(channel => (
                      <label key={channel} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.alerts.lowStock.channels?.includes(channel)}
                          onChange={() => handleAlertChannelToggle('lowStock', channel)}
                          className="checkbox checkbox-sm checkbox-primary"
                        />
                        <span className="text-sm capitalize">{channel.replace('inApp', 'In-app')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rupture de stock */}
          <div className="card bg-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alerts.outOfStock.enabled}
                    onChange={(e) => handleAlertChange('outOfStock', 'enabled', e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                  <span className="font-semibold">Rupture de stock</span>
                </label>
              </div>

              {settings.alerts.outOfStock.enabled && (
                <div className="flex flex-wrap gap-2 ml-8">
                  {['inApp', 'email', 'push', 'sms'].map(channel => (
                    <label key={channel} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.alerts.outOfStock.channels?.includes(channel)}
                        onChange={() => handleAlertChannelToggle('outOfStock', channel)}
                        className="checkbox checkbox-sm checkbox-primary"
                      />
                      <span className="text-sm capitalize">{channel.replace('inApp', 'In-app')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Insights IA */}
          <div className="card bg-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alerts.aiInsights.enabled}
                    onChange={(e) => handleAlertChange('aiInsights', 'enabled', e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                  <span className="font-semibold">Insights IA</span>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Heures silencieuses */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg border-b pb-2">Heures silencieuses</h4>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.schedule.quietHoursEnabled}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                schedule: { ...prev.schedule, quietHoursEnabled: e.target.checked }
              }))}
              className="checkbox checkbox-primary"
            />
            <span>Activer les heures silencieuses</span>
          </label>

          {settings.schedule.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 ml-8">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Début</span>
                </label>
                <input
                  type="time"
                  value={settings.schedule.quietHoursStart}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, quietHoursStart: e.target.value }
                  }))}
                  className="input input-bordered"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Fin</span>
                </label>
                <input
                  type="time"
                  value={settings.schedule.quietHoursEnd}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, quietHoursEnd: e.target.value }
                  }))}
                  className="input input-bordered"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={loading}
          >
            <X size={20} />
            Annuler
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} />
                Enregistrer
              </>
            )}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default AlertSettingsModal;