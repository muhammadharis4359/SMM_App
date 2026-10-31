'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NotificationDrawer from '@/components/NotificationDrawer';
import { FolderOpen, Upload, Image as ImageIcon, Video, Tag, CheckCircle2, Eye, X } from 'lucide-react';
import { getActiveWorkspace } from '@/lib/clientWorkspace';

export default function AssetLibraryPage() {
  const [workspace, setWorkspace] = useState<any>({
    id: '',
    name: 'BranDive Media Solutions',
    timezone: 'America/New_York',
    emergencyPaused: false,
    plan: { id: 'diamond', name: 'Diamond' },
  });
  const [assets, setAssets] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Upload Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [storageKey, setStorageKey] = useState('/logo.png');
  const [uploadCategory, setUploadCategory] = useState('PROMO');
  const [fileType, setFileType] = useState('IMAGE');
  const [tagsInput, setTagsInput] = useState('');
  const [notice, setNotice] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchAssets = async () => {
    try {
      const meRes = await fetch('/api/v1/me');
      if (meRes.status === 401) {
        window.location.href = '/login';
        return;
      }
      const meData = await meRes.json();
      const activeWs = getActiveWorkspace(meData.workspaces);
      if (activeWs) {
        setWorkspace(activeWs);

        const res = await fetch(`/api/v1/workspaces/${activeWs.id}/assets?category=${category}`);
        const data = await res.json();
        setAssets(data.assets || []);

        const notifRes = await fetch(`/api/v1/workspaces/${activeWs.id}/notifications`);
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [category]);

  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.id) return;
    setIsUploading(true);

    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', uploadCategory);
        formData.append('tags', JSON.stringify(tags));

        const res = await fetch(`/api/v1/workspaces/${workspace.id}/assets/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setNotice(`Asset "${selectedFile.name}" successfully uploaded and saved to storage.`);
      } else {
        if (!filename) throw new Error('Please select a file or provide a filename.');
        const res = await fetch(`/api/v1/workspaces/${workspace.id}/assets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename,
            storageKey,
            fileType,
            category: uploadCategory,
            sizeBytes: 15420,
            mimeType: fileType === 'VIDEO' ? 'video/mp4' : 'image/png',
            tags,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setNotice(`Asset "${filename}" registered to workspace library.`);
      }

      setIsUploadOpen(false);
      setSelectedFile(null);
      setFilename('');
      setTagsInput('');
      setTimeout(() => setNotice(''), 4000);
      await fetchAssets();
    } catch (err: any) {
      alert(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar
        currentWorkspace={workspace}
        onTogglePause={async () => {
          await fetch(`/api/v1/workspaces/${workspace.id}/toggle-pause`, { method: 'POST' });
          await fetchAssets();
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          currentWorkspace={workspace}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <main style={{ padding: '28px 32px', flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          {notice && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                color: '#FFFFFF',
                padding: '12px 18px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
              }}
            >
              <CheckCircle2 size={16} color="#10B981" />
              <span>{notice}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF' }}>
                Brand & Campaign Asset Library
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Secure, workspace-isolated media library. Assets are referenced by the campaign engine and social publishers.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bms-select"
                style={{ width: '160px', padding: '8px 12px', fontSize: '0.82rem' }}
              >
                <option value="ALL">All Categories</option>
                <option value="LOGO">Logos & Badges</option>
                <option value="PROMO">Promotions & Hero</option>
                <option value="PRODUCT">Products & Cases</option>
                <option value="VIDEO">Video Footage</option>
              </select>

              <button onClick={() => setIsUploadOpen(true)} className="bms-btn-primary">
                <Upload size={15} />
                <span>Upload Asset</span>
              </button>
            </div>
          </div>

          {/* Asset Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bms-card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '10px',
                }}
              >
                {/* Media Preview Box */}
                <div
                  style={{
                    height: '160px',
                    backgroundColor: 'rgba(8, 13, 26, 0.9)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: '12px',
                    position: 'relative',
                  }}
                >
                  {asset.fileType === 'VIDEO' ? (
                    <Video size={48} color="var(--brandive-blue)" />
                  ) : (
                    <img
                      src={asset.storageKey}
                      alt={asset.filename}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '12px',
                      }}
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}

                  <span
                    className="bms-badge"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(10, 15, 29, 0.8)',
                      border: '1px solid var(--border)',
                      fontSize: '10px',
                    }}
                  >
                    {asset.category}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {asset.filename}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {(asset.sizeBytes / 1024).toFixed(1)} KB • {asset.mimeType}
                  </div>

                  {asset.tags && asset.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {asset.tags.map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className="bms-btn-secondary"
                    style={{ width: '100%', padding: '6px', fontSize: '0.75rem' }}
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsUploadOpen(false)}
        >
          <div
            className="bms-card"
            style={{ width: '100%', maxWidth: '480px', padding: '26px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF' }}>
                Upload Brand Asset
              </h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterAsset}>
              <div style={{ marginBottom: '16px' }}>
                <label className="bms-label">Upload File from Computer (Real Mode)</label>
                <div
                  style={{
                    border: '2px dashed rgba(14, 136, 211, 0.4)',
                    borderRadius: '8px',
                    padding: '18px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(14, 136, 211, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => document.getElementById('real-file-input')?.click()}
                >
                  <Upload size={24} color="#0E88D3" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 500 }}>
                    {selectedFile ? selectedFile.name : 'Click to browse files (PNG, JPG, MP4, PDF)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                      : 'Max 10MB images, 100MB videos'}
                  </div>
                </div>
                <input
                  id="real-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setFilename(file.name);
                      if (file.type.startsWith('video')) setFileType('VIDEO');
                      else setFileType('IMAGE');
                    }
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="bms-label">Asset Title / Name</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="e.g. brandive-autumn-hero.png"
                  className="bms-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="bms-label">Media Type</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="bms-select"
                >
                  <option value="IMAGE">Image (PNG/JPG)</option>
                  <option value="VIDEO">Video (MP4)</option>
                  <option value="LOGO">Brand Logo</option>
                  <option value="DOCUMENT">Document / PDF</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="bms-label">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="bms-select"
                >
                  <option value="PROMO">Promotions & Hero</option>
                  <option value="LOGO">Official Logo & Emblem</option>
                  <option value="PRODUCT">Product Showcase</option>
                  <option value="VIDEO">Video Campaign</option>
                  <option value="GENERAL">General Media</option>
                </select>
              </div>

              {!selectedFile && (
                <div style={{ marginBottom: '14px' }}>
                  <label className="bms-label">Resource Storage Path (Optional fallback)</label>
                  <input
                    type="text"
                    value={storageKey}
                    onChange={(e) => setStorageKey(e.target.value)}
                    placeholder="/logo.png"
                    className="bms-input"
                  />
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label className="bms-label">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="autumn, campaign, hero"
                  className="bms-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setSelectedFile(null);
                  }}
                  className="bms-btn-secondary"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button type="submit" className="bms-btn-primary" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="bms-card"
            style={{ maxWidth: '640px', width: '100%', padding: '24px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>{previewAsset.filename}</div>
              <button onClick={() => setPreviewAsset(null)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px', marginBottom: '16px' }}>
              <img
                src={previewAsset.storageKey}
                alt={previewAsset.filename}
                style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto' }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Category: {previewAsset.category} • Size: {(previewAsset.sizeBytes / 1024).toFixed(1)} KB • Type: {previewAsset.mimeType}
            </div>
          </div>
        </div>
      )}

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
      />
    </div>
  );
}
