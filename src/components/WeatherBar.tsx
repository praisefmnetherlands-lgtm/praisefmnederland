import React, { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, CloudSun, Snowflake } from 'lucide-react'

type WeatherDay = {
  date: string
  max: number
  code: number
}

const AMSTERDAM = {
  latitude: 52.3676,
  longitude: 4.9041,
}

function weatherDescription(code: number): string {
  if (code === 0) return 'Helder'
  if (code === 1) return 'Overwegend helder'
  if (code === 2) return 'Halfbewolkt'
  if (code === 3) return 'Bewolkt'

  if (code === 45 || code === 48) return 'Mist'

  if ([51, 53, 55, 56, 57].includes(code)) return 'Motregen'

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'Regen'
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return 'Sneeuw'
  }

  if ([95, 96, 99].includes(code)) return 'Onweer'

  return 'Wisselvallig'
}

function WeatherIcon({ code }: { code: number }) {
  const className = 'w-5 h-5 text-orange-500'

  if (code === 0) {
    return <Sun className={className} />
  }

  if (code === 1 || code === 2) {
    return <CloudSun className={className} />
  }

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(
      code
    )
  ) {
    return <CloudRain className={className} />
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <Snowflake className={className} />
  }

  return <Cloud className={className} />
}

function getDayLabel(date: string, index: number): string {
  if (index === 0) return 'VANDAAG'
  if (index === 1) return 'MORGEN'

  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'short',
  })
    .format(new Date(`${date}T12:00:00`))
    .replace('.', '')
    .toUpperCase()
}

export default function WeatherBar() {
  const [weather, setWeather] = useState<WeatherDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${AMSTERDAM.latitude}` +
          `&longitude=${AMSTERDAM.longitude}` +
          `&daily=weather_code,temperature_2m_max` +
          `&timezone=Europe%2FAmsterdam` +
          `&forecast_days=3`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Weather request failed')
        }

        const data = await response.json()

        const days: WeatherDay[] = data.daily.time.map(
          (date: string, index: number) => ({
            date,
            max: Math.round(data.daily.temperature_2m_max[index]),
            code: data.daily.weather_code[index],
          })
        )

        setWeather(days)
      } catch (error) {
        console.error('WeatherBar:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [])

  if (!loading && weather.length === 0) {
    return null
  }

  return (
    <section className="w-full border-y border-gray-200 py-5">
      <div className="flex flex-col gap-4 rounded-2xl bg-gray-100 px-4 py-4 md:flex-row md:items-center md:justify-between">

        {/* Amsterdam / Weather Outlook */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <CloudSun className="h-5 w-5 text-orange-500" />
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-orange-500">
              Amsterdam, NL
            </div>

            <div className="text-sm font-bold text-gray-900">
              Weersverwachting
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="flex gap-2 overflow-x-auto">
          {weather.map((day, index) => (
            <div
              key={day.date}
              className="min-w-[82px] rounded-xl bg-white px-3 py-2 text-center"
            >
              <div className="text-[10px] font-bold text-gray-500">
                {getDayLabel(day.date, index)}
              </div>

              <div className="mt-1 flex items-center justify-center gap-1">
                <WeatherIcon code={day.code} />

                <span className="text-sm font-extrabold text-gray-900">
                  {day.max}°C
                </span>
              </div>

              <div className="mt-1 whitespace-nowrap text-[10px] text-gray-500">
                {weatherDescription(day.code)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}