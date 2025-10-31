"use client"

import { useEffect, useRef, useState } from 'react'

interface GoogleMapProps {
  address: string
  className?: string
  showUserLocation?: boolean
  showDistance?: boolean
}

export default function GoogleMap({ 
  address, 
  className = "", 
  showUserLocation = false, 
  showDistance = false 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState(true) // Always show fallback
  const [isLoading, setIsLoading] = useState(false) // Skip loading
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [distance, setDistance] = useState<string | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  // Function to get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(userPos)
        setLocationPermission('granted')
        
        if (showDistance && window.google && window.google.maps) {
          calculateDistance(userPos)
        }
      },
      (error) => {
        console.warn('Error getting user location:', error)
        setLocationPermission('denied')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Function to calculate distance between user and store
  const calculateDistance = (userPos: {lat: number, lng: number}) => {
    if (!window.google || !window.google.maps) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const storeLocation = results[0].geometry.location
        
        const distanceService = new window.google.maps.DistanceMatrixService()
        distanceService.getDistanceMatrix(
          {
            origins: [userPos],
            destinations: [storeLocation],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
          },
          (response: any, status: any) => {
            if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
              const distanceText = response.rows[0].elements[0].distance.text
              const durationText = response.rows[0].elements[0].duration.text
              setDistance(`${distanceText} (${durationText})`)
            }
          }
        )
      }
    })
  }

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap()
      } else {
        // Check if API key exists
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
          console.warn('Google Maps API key not configured')
          setMapError(true)
          setIsLoading(false)
          return
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
          // Script already exists, wait for it to load
          if (window.google && window.google.maps) {
            initializeMap()
          } else {
            existingScript.addEventListener('load', initializeMap)
          }
          return
        }

        // Load Google Maps API if not already loaded
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        
        script.onload = () => {
          initializeMap()
        }
        
        script.onerror = () => {
          console.error('Failed to load Google Maps API')
          setMapError(true)
          setIsLoading(false)
        }
        
        document.head.appendChild(script)
      }
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google) {
        setMapError(true)
        setIsLoading(false)
        return
      }

      try {
        const geocoder = new window.google.maps.Geocoder()
        
        geocoder.geocode({ address }, (results: any, status: any) => {
          setIsLoading(false)
          
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location
            
            // Determine map center and zoom based on whether we have user location
            let mapCenter = location
            let mapZoom = 16
            
            if (showUserLocation && userLocation) {
              // Center map between user and store
              mapCenter = new window.google.maps.LatLng(
                (userLocation.lat + location.lat()) / 2,
                (userLocation.lng + location.lng()) / 2
              )
              mapZoom = 14
            }
            
            const map = new window.google.maps.Map(mapRef.current, {
              zoom: mapZoom,
              center: mapCenter,
              mapTypeId: window.google.maps.MapTypeId.ROADMAP,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            })

            // Store marker
            const storeMarker = new window.google.maps.Marker({
              position: location,
              map: map,
              title: address,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#f97316" stroke="white" stroke-width="4"/>
                    <path d="M20 8C14.48 8 10 12.48 10 18C10 25 20 32 20 32C20 32 30 25 30 18C30 12.48 25.52 8 20 8ZM20 22C17.79 22 16 20.21 16 18C16 15.79 17.79 14 20 14C22.21 14 24 15.79 24 18C24 20.21 22.21 22 20 22Z" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20)
              }
            })

            // User location marker (if available)
            let userMarker: any = null
            if (showUserLocation && userLocation) {
              userMarker = new window.google.maps.Marker({
                position: userLocation,
                map: map,
                title: 'Vị trí của bạn',
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="15" cy="15" r="12" fill="#3b82f6" stroke="white" stroke-width="3"/>
                      <circle cx="15" cy="15" r="6" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(30, 30),
                  anchor: new window.google.maps.Point(15, 15)
                }
              })

              // Draw line between user and store
              const line = new window.google.maps.Polyline({
                path: [userLocation, location],
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                map: map
              })
            }

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px; max-width: 250px;">
                  <h3 style="margin: 0 0 8px 0; color: #f97316; font-weight: bold;">Mê Phương Thịt</h3>
                  <p style="margin: 0; color: #374151; font-size: 14px;">${address}</p>
                  <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">📞 0902 759 466</p>
                  ${distance ? `<p style="margin: 8px 0 0 0; color: #059669; font-size: 12px; font-weight: bold;">📍 ${distance}</p>` : ''}
                </div>
              `
            })

            storeMarker.addListener('click', () => {
              infoWindow.open(map, storeMarker)
            })

            // Auto-open info window
            setTimeout(() => {
              infoWindow.open(map, storeMarker)
            }, 1000)
          } else {
            console.error('Geocoding failed:', status)
            setMapError(true)
          }
        })
      } catch (error) {
        console.error('Map initialization error:', error)
        setMapError(true)
        setIsLoading(false)
      }
    }

    loadGoogleMaps()

    return () => {
      // Cleanup if needed
    }
  }, [address, userLocation, distance])

  // Get user location when component mounts if requested
  useEffect(() => {
    if (showUserLocation && locationPermission === 'prompt') {
      getUserLocation()
    }
  }, [showUserLocation])

  // Show loading state
  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div 
          className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center"
          style={{ minHeight: '400px' }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải bản đồ...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state with fallback content
  if (mapError) {
    return (
      <div className={`relative ${className}`}>
        <div 
          className="w-full h-full rounded-lg bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center"
          style={{ minHeight: '400px' }}
        >
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-orange-800 mb-3">Thịt heo Mẹ Phương</h3>
            <p className="text-gray-700 mb-4 text-lg font-medium">{address}</p>
            
            {/* Distance information */}
            {showDistance && distance && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-semibold">Khoảng cách: {distance}</span>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-gray-800 font-semibold"> 0902 759 466</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-gray-800 font-semibold">support@mephuong.com</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-3">
              {/* Location and distance buttons */}
              {showUserLocation && (
                <div className="flex gap-3">
                  {locationPermission === 'prompt' && (
                    <button
                      onClick={getUserLocation}
                      className="flex-1 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-semibold text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Xác định vị trí
                    </button>
                  )}
                  
                  {showDistance && userLocation && !distance && (
                    <button
                      onClick={() => calculateDistance(userLocation)}
                      className="flex-1 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg font-semibold text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tính khoảng cách
                    </button>
                  )}
                </div>
              )}
              
              {/* Google Maps link */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Mở trong Google Maps
              </a>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>💡 Mẹo:</strong> Click vào nút trên để mở địa chỉ trong Google Maps và chỉ đường đến cửa hàng của chúng tôi!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map controls */}
      {showUserLocation && (
        <div className="absolute top-4 right-4 z-10 space-y-2">
          {locationPermission === 'prompt' && (
            <button
              onClick={getUserLocation}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Vị trí của tôi
            </button>
          )}
          
          {showDistance && userLocation && !distance && (
            <button
              onClick={() => calculateDistance(userLocation)}
              className="bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tính khoảng cách
            </button>
          )}
        </div>
      )}
      
      {/* Distance display */}
      {showDistance && distance && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-semibold text-sm">{distance}</span>
            </div>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}
