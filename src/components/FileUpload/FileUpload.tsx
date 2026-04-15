import React, { useState, useRef } from 'react';
import { supabase, STORAGE_BUCKET } from '../../config/supabase';
import { ProjectAttachment, FileType } from '../../types';
import {
  Upload,
  File,
  FileText,
  Image,
  Video,
  Presentation,
  X,
  Loader2,
  AlertCircle,
  Download,
  Trash2,
  Eye,
  ExternalLink,
} from 'lucide-react';

interface FileUploadProps {
  projectId: string;
  attachments: ProjectAttachment[];
  onUploadComplete: (attachment: ProjectAttachment) => void;
  onDelete: (attachmentId: string) => void;
  disabled?: boolean;
}

const getFileType = (mimeType: string): FileType => {
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || mimeType.includes('pptx')) {
    return 'presentation';
  }
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('docx')) {
    return 'document';
  }
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  return 'other';
};

const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'presentation':
      return Presentation;
    case 'document':
      return FileText;
    case 'image':
      return Image;
    case 'video':
      return Video;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUpload: React.FC<FileUploadProps> = ({
  projectId,
  attachments,
  onUploadComplete,
  onDelete,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<ProjectAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm',
  ];

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError('Bu fayl turi qo\'llab-quvvatlanmaydi. PDF, PPT, DOC, rasm yoki video yuklang.');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError('Fayl hajmi 50MB dan oshmasligi kerak.');
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Create unique filename
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${projectId}/${timestamp}_${safeName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError('Yuklashda xatolik yuz berdi: ' + uploadError.message);
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      setUploadProgress(100);

      const attachment: ProjectAttachment = {
        id: `attachment-${timestamp}`,
        name: filePath,
        originalName: file.name,
        url: urlData.publicUrl,
        type: getFileType(file.type),
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        uploadedBy: 'current-user',
      };

      onUploadComplete(attachment);
      setUploading(false);
      setUploadProgress(0);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Yuklashda xatolik yuz berdi.');
      setUploading(false);
    }
  };

  const handleDelete = async (attachment: ProjectAttachment) => {
    if (!confirm('Bu faylni o\'chirmoqchimisiz?')) return;

    try {
      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([attachment.name]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
      }

      onDelete(attachment.id);
    } catch (err) {
      console.error('Delete error:', err);
      // Still remove from UI even if Supabase delete fails
      onDelete(attachment.id);
    }
  };

  const handlePreview = (attachment: ProjectAttachment) => {
    if (attachment.type === 'image' || attachment.type === 'video' || attachment.mimeType === 'application/pdf') {
      setPreviewFile(attachment);
    } else {
      // Boshqa fayl turlari uchun yangi tabda ochish
      window.open(attachment.url, '_blank');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-10 h-10 text-emerald-600 mx-auto animate-spin" />
            <div className="w-full max-w-xs mx-auto">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{Math.round(uploadProgress)}% yuklandi</p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              Faylni bu yerga tashlang yoki <span className="text-emerald-600">tanlang</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              PDF, PPT, DOC, rasm yoki video (max 50MB)
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Uploaded Files */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Yuklangan fayllar ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.type);
              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  {/* Thumbnail yoki Icon */}
                  {attachment.type === 'image' ? (
                    <div
                      className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer border"
                      onClick={() => handlePreview(attachment)}
                    >
                      <img
                        src={attachment.url}
                        alt={attachment.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                      <FileIcon className="w-5 h-5 text-gray-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Ko'rish tugmasi */}
                    <button
                      onClick={() => handlePreview(attachment)}
                      className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Ko'rish"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Yuklab olish */}
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Yuklab olish"
                      download
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* O'chirish */}
                    {!disabled && (
                      <button
                        onClick={() => handleDelete(attachment)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                {previewFile.type === 'image' ? (
                  <Image className="w-5 h-5 text-emerald-600" />
                ) : previewFile.type === 'video' ? (
                  <Video className="w-5 h-5 text-purple-600" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600" />
                )}
                <span className="font-medium text-gray-900 truncate max-w-md">
                  {previewFile.originalName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Yangi tabda ochish"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] flex items-center justify-center bg-gray-100">
              {previewFile.type === 'image' && (
                <img
                  src={previewFile.url}
                  alt={previewFile.originalName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              )}

              {previewFile.type === 'video' && (
                <video
                  src={previewFile.url}
                  controls
                  className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
                >
                  Brauzeringiz video formatini qo'llab-quvvatlamaydi.
                </video>
              )}

              {previewFile.mimeType === 'application/pdf' && (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[70vh] rounded-lg shadow-lg"
                  title={previewFile.originalName}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
