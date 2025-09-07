"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Leaf, CheckCircle, Clock, User, Weight, QrCode, Sparkles } from "lucide-react"

interface HarvestData {
  plantType: string
  quantity: string
  farmerID: string
  location: { lat: number; lng: number } | null
  timestamp: string
}

interface SubmissionResult {
  batchID: string
  timestamp: string
  success: boolean
}

export default function FarmerHarvestApp() {
  const [currentStep, setCurrentStep] = useState<"form" | "confirmation">("form")
  const [formData, setFormData] = useState<HarvestData>({
    plantType: "",
    quantity: "",
    farmerID: "",
    location: null,
    timestamp: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  // Auto-capture GPS location
  const captureLocation = () => {
    setLocationStatus("loading")
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }))
          setLocationStatus("success")
        },
        (error) => {
          console.error("Location error:", error)
          setLocationStatus("error")
        },
      )
    } else {
      setLocationStatus("error")
    }
  }

  // Auto-capture timestamp
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      timestamp: new Date().toISOString(),
    }))
  }, [])

  // Simulate blockchain submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.plantType || !formData.quantity || !formData.farmerID || !formData.location) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call to blockchain
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const batchID = `BATCH-${Date.now().toString().slice(-6)}`
    setSubmissionResult({
      batchID,
      timestamp: new Date().toLocaleString(),
      success: true,
    })

    setIsSubmitting(false)
    setCurrentStep("confirmation")
  }

  const resetForm = () => {
    setCurrentStep("form")
    setFormData({
      plantType: "",
      quantity: "",
      farmerID: "",
      location: null,
      timestamp: new Date().toISOString(),
    })
    setSubmissionResult(null)
    setLocationStatus("idle")
  }

  const generateQRCode = (batchID: string) => {
    const qrData = `https://blockchain-verify.com/batch/${batchID}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
  }

  const shareQRCode = async (batchID: string) => {
    const qrUrl = generateQRCode(batchID)

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Harvest Batch ${batchID}`,
          text: `View harvest details for batch ${batchID}`,
          url: `https://blockchain-verify.com/batch/${batchID}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`https://blockchain-verify.com/batch/${batchID}`)
        alert("Batch link copied to clipboard!")
      } catch (error) {
        console.log("Error copying to clipboard:", error)
      }
    }
  }

  if (currentStep === "confirmation" && submissionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
        <div className="mx-auto max-w-md space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                Harvest Recorded!
              </h1>
              <p className="text-gray-600 font-medium">Successfully saved to blockchain</p>
            </div>
          </div>

          {/* Batch Details */}
          <Card className="shadow-xl border-emerald-100 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-emerald-50 to-green-50">
              <CardTitle className="text-xl text-emerald-800 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Batch Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className="text-lg px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold tracking-wide">
                  {submissionResult.batchID}
                </Badge>
              </div>

              <Separator className="bg-emerald-200" />

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-emerald-50">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm text-emerald-700 font-medium">Plant:</span>
                  <span className="font-bold text-emerald-800">{formData.plantType}</span>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-green-50">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Weight className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-green-700 font-medium">Quantity:</span>
                  <span className="font-bold text-green-800">{formData.quantity} kg</span>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-700 font-medium">Farmer:</span>
                  <span className="font-bold text-blue-800">{formData.farmerID}</span>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-purple-50">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-purple-700 font-medium">Time:</span>
                  <span className="font-bold text-purple-800">{submissionResult.timestamp}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={resetForm}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold"
              size="lg"
            >
              <Leaf className="w-5 h-5 mr-2" />
              Record Another Harvest
            </Button>
            <Button
              variant="outline"
              className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold bg-transparent"
              size="lg"
              onClick={() => shareQRCode(submissionResult.batchID)}
            >
              <QrCode className="w-5 h-5 mr-2" />
              Share Batch QR Code
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            Harvest Tracker
          </h1>
          <p className="text-gray-600 text-balance font-medium">Record your harvest on the blockchain</p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-emerald-100 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              New Harvest Entry
            </CardTitle>
            <CardDescription className="text-emerald-700">Fill in the details of your harvest</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Plant Type */}
              <div className="space-y-2">
                <Label htmlFor="plant-type" className="text-emerald-800 font-semibold">
                  Plant Type
                </Label>
                <Select
                  value={formData.plantType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, plantType: value }))}
                >
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                    <SelectValue placeholder="Select plant type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tulsi">🌿 Tulsi</SelectItem>
                    <SelectItem value="Patharchitta">🌱 Patharchitta</SelectItem>
                    <SelectItem value="Mulethi">🌾 Mulethi (Licorice)</SelectItem>
                    <SelectItem value="Ashwagandha">🍃 Ashwagandha</SelectItem>
                    <SelectItem value="Brahmi">🌿 Brahmi</SelectItem>
                    <SelectItem value="Neem">🌳 Neem</SelectItem>
                    <SelectItem value="Aloe Vera">🌵 Aloe Vera</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-emerald-800 font-semibold">
                  Quantity (kg)
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity in kg"
                  value={formData.quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                  min="0"
                  step="0.1"
                  className="border-emerald-200 focus:border-emerald-400"
                />
              </div>

              {/* Farmer ID */}
              <div className="space-y-2">
                <Label htmlFor="farmer-id" className="text-emerald-800 font-semibold">
                  Farmer ID
                </Label>
                <Input
                  id="farmer-id"
                  placeholder="Enter your farmer ID"
                  value={formData.farmerID}
                  onChange={(e) => setFormData((prev) => ({ ...prev, farmerID: e.target.value }))}
                  className="border-emerald-200 focus:border-emerald-400"
                />
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-emerald-800 font-semibold">GPS Location</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={captureLocation}
                  disabled={locationStatus === "loading"}
                  className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-3 py-6 bg-transparent"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-medium">
                    {locationStatus === "loading"
                      ? "Getting Location..."
                      : locationStatus === "success"
                        ? "Location Captured ✓"
                        : "Capture Location"}
                  </span>
                </Button>
                {formData.location && (
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-700 font-medium">
                      📍 Lat: {formData.location.lat.toFixed(6)}, Lng: {formData.location.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-6"
                size="lg"
                disabled={
                  !formData.plantType || !formData.quantity || !formData.farmerID || !formData.location || isSubmitting
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving to Blockchain...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Record Harvest
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                Your harvest data will be securely stored on the Ethereum blockchain, ensuring transparency and
                traceability for your produce. 🔒
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
