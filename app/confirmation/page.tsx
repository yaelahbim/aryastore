"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, ShoppingBag, MessageCircle, Package, Ticket, Trash2, Minus, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import storeConfig from "../../data/store-config.json"

interface Product {
  id: string
  name: string
  type: "voucher" | "physical"
  price: number
  image: string
  description: string
  originalPrice?: number
}

export default function ConfirmationPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [cart, setCart] = useState<Record<string, number>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  const { storeInfo, products, formLabels, messages } = storeConfig
  const minPurchase = storeInfo.minPurchase

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
        // If cart is empty, redirect to home
        if (Object.keys(parsedCart).length === 0) {
          router.replace("/")
          return
        }
      } else {
        router.replace("/")
        return
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      router.replace("/")
      return
    }
    setIsLoaded(true)
  }, [router])

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("cart", JSON.stringify(cart))
        // If cart becomes empty, redirect to home
        if (Object.keys(cart).length === 0) {
          setTimeout(() => {
            router.replace("/")
          }, 3000)
        }
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [cart, isLoaded, router])

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = products.find((p) => p.id === id)
    return sum + (product?.price || 0) * qty
  }, 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart((prev) => {
      const newCart = { ...prev }
      if (newQuantity <= 0) {
        delete newCart[productId]
      } else {
        newCart[productId] = newQuantity
      }
      return newCart
    })
  }

  const removeItem = (productId: string) => {
    setCart((prev) => {
      const newCart = { ...prev }
      delete newCart[productId]
      return newCart
    })
  }

  // Handle phone number input - only allow numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "")
    setPhone(numericValue)
  }

  const sendToWhatsApp = () => {
    if (!name || !email || !phone) {
      alert("Mohon lengkapi semua data yang diperlukan")
      return
    }

    if (totalItems < minPurchase) {
      alert(`Minimal pembelian ${minPurchase} item`)
      return
    }

    const orderDetails = Object.entries(cart)
      .map(([id, qty]) => {
        const product = products.find((p) => p.id === id)
        return `${product?.name} x${qty} = ${formatPrice((product?.price || 0) * qty)}`
      })
      .join("\n")

    const message = messages.orderMessage
      .replace("{orderDetails}", orderDetails)
      .replace("{total}", formatPrice(totalPrice))
      .replace("{name}", name)
      .replace("{email}", email)
      .replace("{phone}", phone)

    const whatsappUrl = `https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    // Clear cart after successful order
    localStorage.removeItem("cart")
    setCart({})
  }

  const goBack = () => {
    router.push("/")
  }

  // Premium Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-white/80 animate-pulse" />
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold gradient-text">AryaPedia</h2>
            <p className="text-gray-400 font-light">Memuat pesanan premium...</p>
          </div>
        </div>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="mx-4 max-w-md glass-effect elegant-card border-white/20">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <ShoppingBag className="w-20 h-20 mx-auto text-gray-400" />
              <div className="absolute inset-0 bg-gray-400/20 blur-2xl rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold mb-3 gradient-text">Keranjang Kosong</h2>
            <p className="text-gray-300 mb-6 font-light">Semua item telah dihapus. Kembali untuk berbelanja lagi.</p>
            <Button
              onClick={goBack}
              className="premium-button text-white hover:text-blue-300 transition-all px-6 py-3 rounded-xl elegant-hover"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali Belanja
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Premium Header */}
      <div className="sticky top-0 z-50 glass-effect border-b border-white/10">
        <div className="container mx-auto px-6 py-6 max-w-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="text-white hover:bg-white/10 p-3 transition-all duration-300 rounded-xl elegant-hover"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h1 className="text-xl font-bold gradient-text">Konfirmasi Pesanan</h1>
              </div>
              <p className="text-gray-300 text-sm font-light">Review & checkout pesanan premium Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-md pb-40">
        {/* Premium Order Summary */}
        <Card className="mb-8 glass-effect elegant-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="gradient-text">Ringkasan Pesanan</span>
              <Badge className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 font-medium">
                {totalItems} item
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(cart).map(([id, qty]) => {
              const product = products.find((p) => p.id === id)
              if (!product) return null

              return (
                <div
                  key={id}
                  className="glass-effect rounded-xl p-4 border border-white/10 elegant-hover transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-xl"></div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{product.name}</h3>
                        {product.type === "voucher" ? (
                          <Ticket className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Package className="w-4 h-4 text-green-400" />
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(id, qty - 1)}
                            className="w-8 h-8 p-0 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all rounded-lg"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold w-8 text-center text-white bg-black/40 rounded-lg px-2 py-1">
                            {qty}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(id, qty + 1)}
                            className="w-8 h-8 p-0 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all rounded-lg"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-400 gradient-text">
                            {formatPrice(product.price * qty)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(id)}
                            className="w-8 h-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all rounded-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="border-t border-white/10 pt-6">
              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-xl text-white">Total:</span>
                  <span className="font-bold text-2xl gradient-text">{formatPrice(totalPrice)}</span>
                </div>
                <div className="text-sm text-gray-400 font-light">{totalItems} item • Sudah termasuk pajak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Minimum Purchase Warning */}
        {totalItems < minPurchase && (
          <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 text-amber-300 p-4 rounded-xl mb-8 text-center font-medium backdrop-blur-sm animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">Perhatian Premium</span>
            </div>
            <p className="font-light">
              Minimal pembelian {minPurchase} item. Tambah {minPurchase - totalItems} item lagi atau kembali ke halaman
              utama.
            </p>
          </div>
        )}

        {/* Premium Customer Information Form */}
        <Card className="mb-12 glass-effect elegant-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                <span className="text-lg">📝</span>
              </div>
              <span className="gradient-text">Data Pemesan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{formLabels.name}</label>
              <Input
                type="text"
                placeholder={formLabels.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-sm border border-white/20 focus:border-white/40 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-black/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{formLabels.email}</label>
              <Input
                type="email"
                placeholder={formLabels.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-sm border border-white/20 focus:border-white/40 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-black/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{formLabels.phone}</label>
              <Input
                type="tel"
                placeholder={formLabels.phonePlaceholder}
                value={phone}
                onChange={handlePhoneChange}
                className="w-full bg-black/40 backdrop-blur-sm border border-white/20 focus:border-white/40 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-black/60"
                pattern="[0-9]*"
                inputMode="numeric"
                required
              />
              {phone && !/^[0-9]+$/.test(phone) && (
                <p className="text-red-400 text-xs mt-2 font-light">Nomor WhatsApp hanya boleh berisi angka</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Sticky Footer - Checkout */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/10">
        <div className="container mx-auto px-6 py-6 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-xl font-bold gradient-text">Total: {formatPrice(totalPrice)}</div>
              <div className="text-sm text-gray-400 font-light">{totalItems} item premium</div>
            </div>
            <div className="text-right">
              {totalItems < minPurchase ? (
                <Badge className="text-xs bg-gradient-to-r from-red-600 to-red-700 text-white border-0 font-medium">
                  Kurang {minPurchase - totalItems} item
                </Badge>
              ) : (
                <Badge className="text-sm bg-gradient-to-r from-green-600 to-green-700 text-white border-0 font-medium">
                  ✨ Siap Checkout
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={sendToWhatsApp}
            disabled={!name || !email || !phone || totalItems < minPurchase}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 transition-all duration-300 elegant-hover"
          >
            <MessageCircle className="w-5 h-5 mr-3" />
            <Sparkles className="w-4 h-4 mr-2" />
            {messages.checkoutButton}
          </Button>

          {(!name || !email || !phone || totalItems < minPurchase) && (
            <p className="text-xs text-gray-400 text-center mt-3 font-light">
              {totalItems < minPurchase
                ? `Tambah ${minPurchase - totalItems} item lagi untuk checkout `
                : "Lengkapi semua data untuk melanjutkan ke checkout"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
