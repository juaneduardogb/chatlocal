'use client';

import { cn } from '@/utilities/utils';
import createGlobe, { COBEOptions } from 'cobe';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

function Globe({ className }: { className?: string }) {
    const { theme } = useTheme();

    let config: COBEOptions = {
        width: 200,
        height: 200,
        onRender: () => {},
        devicePixelRatio: 3,
        phi: 0,
        theta: -0.3, // Rotación para centrar en Chile y Argentina
        dark: 0.09,
        diffuse: 0.5,
        mapSamples: 1000,
        mapBrightness: 2,
        baseColor: [1, 1, 1],
        markerColor: [217 / 255, 57 / 255, 84 / 255],
        glowColor: [1, 1, 1],
        markers: [
            { location: [-33.4489, -70.6693], size: 0.2 }, // Santiago, Chile
            { location: [-34.6037, -58.3816], size: 0.04 }, // Buenos Aires, Argentina

            { location: [34.5553, 69.2075], size: 0.04 }, // Afghanistan
            { location: [41.3275, 19.8187], size: 0.04 }, // Albania
            { location: [36.7538, 3.0588], size: 0.04 }, // Algeria
            { location: [-8.8383, 13.2344], size: 0.04 }, // Angola
            { location: [40.1792, 44.4991], size: 0.04 }, // Armenia
            { location: [-33.8688, 151.2093], size: 0.04 }, // Australia
            { location: [48.2082, 16.3738], size: 0.04 }, // Austria
            { location: [40.4093, 49.8671], size: 0.04 }, // Azerbaijan
            { location: [25.0443, -77.3504], size: 0.04 }, // Bahamas
            { location: [26.2285, 50.586], size: 0.04 }, // Bahrain
            { location: [23.8103, 90.4125], size: 0.04 }, // Bangladesh
            { location: [13.1132, -59.5988], size: 0.04 }, // Barbados
            { location: [53.9045, 27.5615], size: 0.04 }, // Belarus
            { location: [50.8503, 4.3517], size: 0.04 }, // Belgium
            { location: [32.2949, -64.7866], size: 0.04 }, // Bermuda
            { location: [-16.4897, -68.1193], size: 0.04 }, // Bolivia
            { location: [43.8564, 18.4131], size: 0.04 }, // Bosnia and Herzegovina
            { location: [-24.6282, 25.9231], size: 0.04 }, // Botswana
            { location: [-23.5505, -46.6333], size: 0.04 }, // Brazil
            { location: [18.4207, -64.64], size: 0.04 }, // British Virgin Islands
            { location: [42.6977, 23.3219], size: 0.04 }, // Bulgaria
            { location: [11.5564, 104.9282], size: 0.04 }, // Cambodia
            { location: [3.848, 11.5021], size: 0.04 }, // Cameroon
            { location: [43.6532, -79.3832], size: 0.04 }, // Canada
            { location: [19.2869, -81.3674], size: 0.04 }, // Cayman Islands
            { location: [12.1348, 15.0557], size: 0.04 }, // Chad
            { location: [39.9042, 116.4074], size: 0.04 }, // China
            { location: [4.711, -74.0721], size: 0.04 }, // Colombia
            { location: [-4.2634, 15.2429], size: 0.04 }, // Congo
            { location: [9.9281, -84.0907], size: 0.04 }, // Costa Rica
            { location: [45.815, 15.9819], size: 0.04 }, // Croatia
            { location: [12.1224, -68.8824], size: 0.04 }, // Curaçao
            { location: [35.1856, 33.3823], size: 0.04 }, // Cyprus
            { location: [50.0755, 14.4378], size: 0.04 }, // Czech Republic
            { location: [-4.4419, 15.2663], size: 0.04 }, // Democratic Republic of the Congo
            { location: [55.6761, 12.5683], size: 0.04 }, // Denmark
            { location: [18.4861, -69.9312], size: 0.04 }, // Dominican Republic
            { location: [-0.1807, -78.4678], size: 0.04 }, // Ecuador
            { location: [30.0444, 31.2357], size: 0.04 }, // Egypt
            { location: [13.6929, -89.2182], size: 0.04 }, // El Salvador
            { location: [3.7523, 8.7742], size: 0.04 }, // Equatorial Guinea
            { location: [59.437, 24.7536], size: 0.04 }, // Estonia
            { location: [9.032, 38.7492], size: 0.04 }, // Ethiopia
            { location: [-18.1416, 178.4419], size: 0.04 }, // Fiji
            { location: [60.1699, 24.9384], size: 0.04 }, // Finland
            { location: [48.8566, 2.3522], size: 0.04 }, // France
            { location: [0.4162, 9.4673], size: 0.04 }, // Gabon
            { location: [41.7151, 44.8271], size: 0.04 }, // Georgia
            { location: [50.1109, 8.6821], size: 0.04 }, // Germany
            { location: [5.6037, -0.187], size: 0.04 }, // Ghana
            { location: [36.1408, -5.3536], size: 0.04 }, // Gibraltar
            { location: [37.9838, 23.7275], size: 0.04 }, // Greece
            { location: [14.6349, -90.5069], size: 0.04 }, // Guatemala
            { location: [9.6412, -13.5784], size: 0.04 }, // Guinea
            { location: [14.0723, -87.1921], size: 0.04 }, // Honduras
            { location: [22.3193, 114.1694], size: 0.04 }, // Hong Kong
            { location: [47.4979, 19.0402], size: 0.04 }, // Hungary
            { location: [64.1265, -21.8174], size: 0.04 }, // Iceland
            { location: [28.6139, 77.209], size: 0.04 }, // India
            { location: [-6.2088, 106.8456], size: 0.04 }, // Indonesia
            { location: [33.3152, 44.3661], size: 0.04 }, // Iraq
            { location: [53.3498, -6.2603], size: 0.04 }, // Ireland
            { location: [54.1509, -4.4815], size: 0.04 }, // Isle of Man
            { location: [32.0853, 34.7818], size: 0.04 }, // Israel
            { location: [41.9028, 12.4964], size: 0.04 }, // Italy
            { location: [5.36, -4.0083], size: 0.04 }, // Ivory Coast
            { location: [18.0179, -76.8099], size: 0.04 }, // Jamaica
            { location: [35.6762, 139.6503], size: 0.04 }, // Japan
            { location: [31.9454, 35.9284], size: 0.04 }, // Jordan
            { location: [43.222, 76.8512], size: 0.04 }, // Kazakhstan
            { location: [-1.2921, 36.8219], size: 0.04 }, // Kenya
            { location: [29.3759, 47.9774], size: 0.04 } // Kuwait
        ]
    };

    useEffect(() => {
        if (theme === 'light') {
            config.glowColor = [1, 1, 1];
            config.markerColor = [217 / 255, 57 / 255, 84 / 255]; // Color de los marcadores
        } else {
            config.baseColor = [49 / 255, 49 / 255, 58 / 255]; // Fondo oscuro
            config.glowColor = [49 / 255, 49 / 255, 58 / 255]; // Color de resplandor en modo oscuro
        }
        if (canvasRef.current) {
            const globe = createGlobe(canvasRef.current!, {
                ...config,
                width: width * 2,
                height: width * 2,
                phi: Math.PI / 2,
                onRender
            });
            return () => globe.destroy();
        }
    }, [theme]);

    let phi = 0;
    let width = 0;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointerInteracting = useRef(null);
    const [r, _] = useState(0);

    const onRender = useCallback(
        (state: Record<string, any>) => {
            if (!pointerInteracting.current) phi += 0.002;
            state.phi = phi + r;
            state.width = width * 3;
            state.height = width * 3;
        },
        [r]
    );

    const onResize = () => {
        if (canvasRef.current) {
            width = canvasRef.current.offsetWidth;
        }
    };

    useEffect(() => {
        window.addEventListener('resize', onResize);
        onResize();

        const globe = createGlobe(canvasRef.current!, {
            ...config,
            width: width * 2,
            height: width * 2,
            phi: Math.PI / 2,
            onRender
        });

        setTimeout(() => (canvasRef.current!.style.opacity = '1'));
        return () => globe.destroy();
    }, []);
    console.log('render');

    return (
        <div className={cn('max-w-xl w-md flex items-center justify-center justify-items-center bg-background', className)}>
            <canvas
                className={cn(
                    'bg-background opacity-0 transition-size duration-500 [contain:layout_paint_size] pointer-events-none md:h-[500px] md:w-[500px] h-[400px] w-[400px]'
                )}
                ref={canvasRef}
            />
        </div>
    );
}

export default memo(Globe);
