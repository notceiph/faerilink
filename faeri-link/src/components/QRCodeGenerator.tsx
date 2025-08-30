import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Link } from '@/types/database'
import { generateQRCode } from '@/lib/utils'
import {
  QrCode,
  Download,
  Copy,
  Smartphone,
  Globe,
  Palette,
  Settings
} from 'lucide-react'

interface QRCodeGeneratorProps {
  link: Link
  onClose: () => void
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  link,
  onClose,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [format, setFormat] = useState<'png' | 'svg'>('png')
  const [size, setSize] = useState(256)
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQR = async () => {
    setIsGenerating(true)
    try {
      // For now, we'll create a simple QR code representation
      // In a real implementation, you'd use a library like qrcode
      const qrData = await generateQRCode(link.url)
      setQrCodeDataUrl(qrData)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQR = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement('a')
    link.href = qrCodeDataUrl
    link.download = `qrcode-${Date.now()}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyToClipboard = async () => {
    if (!qrCodeDataUrl) return

    try {
      const response = await fetch(qrCodeDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      alert('QR code copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      alert('Failed to copy QR code. Try downloading instead.')
    }
  }

  const getFullUrl = () => {
    // In a real implementation, this would be your domain
    return link.url
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generate QR Code
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Link Info */}
        <div className="p-3 border rounded-lg">
          <h4 className="font-medium text-sm mb-1">{link.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{getFullUrl()}</p>
        </div>

        {/* QR Code Preview */}
        <div className="flex justify-center">
          <div className="border-2 border-dashed border-muted rounded-lg p-4">
            {qrCodeDataUrl ? (
              <div className="space-y-4">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="max-w-full h-auto"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor,
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <QrCode className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Click generate to create QR code</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'png' | 'svg')}
                className="w-full px-3 py-2 border rounded-md bg-background mt-1"
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md bg-background mt-1"
              >
                <option value={128}>128x128</option>
                <option value={256}>256x256</option>
                <option value={512}>512x512</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Foreground</label>
              <Input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Background</label>
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {!qrCodeDataUrl ? (
            <Button
              onClick={generateQR}
              disabled={isGenerating}
              className="w-full"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={downloadQR} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-2">QR Code Usage:</p>
          <ul className="space-y-1">
            <li>• Print for offline marketing</li>
            <li>• Add to business cards</li>
            <li>• Use in social media posts</li>
            <li>• Display at events or locations</li>
          </ul>
        </div>

        {/* Mobile Preview */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-blue-700">
            Mobile users can scan this QR code to visit your link
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default QRCodeGenerator
