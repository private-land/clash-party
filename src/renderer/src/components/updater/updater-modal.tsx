import {
  Button,
  Code,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress
} from '@heroui/react'
import { toast } from '@renderer/components/base/toast'
import ReactMarkdown from 'react-markdown'
import React, { useEffect, useState } from 'react'
import { downloadAndInstallUpdate, DownloadProgress } from '@renderer/utils/ipc'
import { useTranslation } from 'react-i18next'

interface Props {
  version: string
  changelog: string
  onClose: () => void
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const UpdaterModal: React.FC<Props> = (props) => {
  const { version, changelog, onClose } = props
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const handleProgress = (_e: Electron.IpcRendererEvent, ...args: unknown[]): void => {
      const p = args[0] as DownloadProgress
      setProgress(p)
    }

    window.electron.ipcRenderer.on('updateDownloadProgress', handleProgress)

    return () => {
      window.electron.ipcRenderer.removeListener('updateDownloadProgress', handleProgress)
    }
  }, [])

  const onUpdate = async (): Promise<void> => {
    try {
      await downloadAndInstallUpdate(version)
    } catch (e) {
      toast.error(String(e))
    }
  }

  return (
    <Modal
      backdrop="blur"
      classNames={{ backdrop: 'top-[48px]' }}
      hideCloseButton
      isOpen={true}
      onOpenChange={onClose}
      scrollBehavior="inside"
    >
      <ModalContent className="h-full w-[calc(100%-100px)]">
        <ModalHeader className="flex justify-between app-drag">
          <div>{t('common.updater.versionReady', { version })}</div>
          <Button
            color="primary"
            size="sm"
            className="flex app-nodrag"
            onPress={() => {
              open(`https://github.com/mihomo-party-org/mihomo-party/releases/tag/v${version}`)
            }}
          >
            {t('common.updater.goToDownload')}
          </Button>
        </ModalHeader>
        <ModalBody className="h-full">
          <div className="markdown-body select-text">
            <ReactMarkdown
              components={{
                a: ({ ...props }) => <a target="_blank" className="text-primary" {...props} />,
                code: ({ children }) => <Code size="sm">{children}</Code>,
                h3: ({ ...props }) => <h3 className="text-lg font-bold" {...props} />,
                li: ({ children }) => <li className="list-disc list-inside">{children}</li>
              }}
            >
              {changelog}
            </ReactMarkdown>
          </div>
        </ModalBody>
        <ModalFooter className="flex-col gap-2">
          {downloading && progress && (
            <div className="w-full">
              <Progress
                size="sm"
                value={progress.percent >= 0 ? progress.percent : undefined}
                isIndeterminate={progress.percent < 0}
                color="primary"
                className="mb-1"
              />
              <div className="text-xs text-default-500 text-center">
                {progress.total > 0
                  ? `${formatBytes(progress.downloaded)} / ${formatBytes(progress.total)} (${progress.percent}%)`
                  : `${formatBytes(progress.downloaded)} ${t('common.updater.downloaded')}`}
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end w-full">
            <Button size="sm" variant="light" onPress={onClose} isDisabled={downloading}>
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              color="primary"
              isLoading={downloading}
              onPress={async () => {
                try {
                  setDownloading(true)
                  setProgress(null)
                  await onUpdate()
                  onClose()
                } catch (e) {
                  toast.error(String(e))
                } finally {
                  setDownloading(false)
                  setProgress(null)
                }
              }}
            >
              {t('common.updater.update')}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default UpdaterModal
