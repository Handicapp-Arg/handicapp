'use client'

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider' // Necesitare ver si existe Slider, si no input range
import getCroppedImg from '@/lib/utils/cropImage'
import { Label } from '@/components/ui/label'

interface ImageCropperDialogProps {
  isOpen: boolean
  imageSrc: string | null
  onClose: () => void
  onCropComplete: (croppedBlob: Blob) => void
  aspect?: number
}

export function ImageCropperDialog({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  aspect = 3 / 4, // Default portrait for horse card
}: ImageCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setLoading(true)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (croppedBlob) {
        onCropComplete(croppedBlob)
        onClose()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-slate-900 border-slate-800 text-white">
        <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 z-10">
          <DialogTitle className="text-white">Ajustar Imagen</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[400px] bg-black">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={setZoom}
              classes={{
                containerClassName: 'bg-black',
                mediaClassName: '',
                cropAreaClassName: 'border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]',
              }}
            />
          )}
        </div>

        <div className="p-4 bg-slate-900 space-y-4">
          <div className="flex items-center gap-4">
            <Label className="text-xs text-slate-400 font-medium uppercase tracking-wider min-w-[3rem]">Zoom</Label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
          
          <DialogFooter className="flex-row gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-white text-slate-900 hover:bg-slate-200 font-semibold"
            >
              {loading ? 'Procesando...' : 'Confirmar Recorte'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
