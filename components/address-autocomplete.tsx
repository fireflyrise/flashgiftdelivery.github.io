'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (addressComponents: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = '123 Main Street, Apt 4B',
  disabled = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    // Load Google Maps script
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        initAutocomplete();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => initAutocomplete());
        return;
      }

      // Load the script for the first time
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initAutocomplete();
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (!inputRef.current) return;

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.address_components) return;

        // Parse address components
        let street = '';
        let city = '';
        let state = '';
        let zipcode = '';

        for (const component of place.address_components) {
          const componentType = component.types[0];

          switch (componentType) {
            case 'street_number':
              street = component.long_name + ' ';
              break;
            case 'route':
              street += component.long_name;
              break;
            case 'locality':
              city = component.long_name;
              break;
            case 'administrative_area_level_1':
              state = component.short_name;
              break;
            case 'postal_code':
              zipcode = component.long_name;
              break;
          }
        }

        // Update parent component
        onChange(street);
        onPlaceSelect({ street, city, state, zipcode });
      });
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, onPlaceSelect]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required
    />
  );
}
