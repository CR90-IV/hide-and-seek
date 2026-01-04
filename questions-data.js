// Question data structure
const questionsData = {
    matching: {
        color: '#232F41',
        title: 'MATCHING',
        description: '"Is your nearest ___ the same as my ___?"',
        badges: ['YES / NO', '5 min', 'Draw 3, keep 1'],
        answer: 'YES or NO',
        reward: 'Draw 3, keep 1',
        note: "Locations outside map boundaries don't exist = null answer (still counts, you still draw)",
        questions: [
            {
                subcategory: 'Transport',
                items: [
                    {
                        title: 'Train service',
                        question: 'Does my train stop at your station?',
                        note: "",
                        icon: 'directions_transit'
                    },
                    {
                        title: "Station name length",
                        question: "Is the length of your station's name the same as the length of my station's name?",
                        note: "Count all characters including hyphens/spaces/'station'",
                        icon: 'text_fields'
                    },
                    {
                        title: 'Commercial airport',
                        question: 'Is your nearest commercial airport the same as my commercial airport?',
                        note: 'Verify via Google Flights',
                        icon: 'flight'
                    }
                ]
            },
            {
                subcategory: 'London-Specific',
                items: [
                    {
                        title: 'London borough',
                        question: 'Is your London Borough the same as my London Borough?',
                        note: '',
                        icon: 'globe_uk'
                    },
                    {
                        title: 'TfL fare zone',
                        question: "Is your station's fare zone the same as my nearest station's fare zone?",
                        note: 'YES if stations share any zones',
                        icon: 'transit_ticket'
                    }
                ]
            },
            {
                subcategory: 'Natural',
                items: [
                    {
                        title: 'Landmass',
                        question: 'Is your landmass the same as my landmass?',
                        note: "Consult 'London waterways' map; e.g. opposite banks of Thames are separate landmasses",
                        icon: 'terrain'
                    },
                    {
                        title: 'Park',
                        question: 'Is your nearest park the same as my park?',
                        note: 'Measure to map icon (not to boundary)',
                        icon: 'forest'
                    }
                ]
            },
            {
                subcategory: 'Streets',
                items: [
                    {
                        title: 'Street or path',
                        question: 'Is your nearest street or path the same as my street or path?',
                        note: 'Ends when name changes, including East/West',
                        icon: 'follow_the_signs'
                    }
                ]
            },
            {
                subcategory: 'Places of Interest',
                items: [
                    {
                        title: 'Museum',
                        question: 'Is your nearest museum the same as my nearest museum?',
                        note: 'Measure to map icon',
                        icon: 'museum'
                    },
                    {
                        title: 'Cinema',
                        question: 'Is your nearest cinema the same as my nearest cinema?',
                        note: 'Measure to map icon',
                        icon: 'movie'
                    },
                    {
                        title: 'Amusement park',
                        question: 'Is your nearest amusement park the same as my nearest amusement park?',
                        note: 'Measure to map icon',
                        icon: 'attractions'
                    },
                    {
                        title: 'Zoo',
                        question: 'Is your nearest zoo the same as my nearest zoo?',
                        note: 'Measure to map icon',
                        icon: 'pets'
                    },
                    {
                        title: 'Aquarium',
                        question: 'Is your nearest aquarium the same as my nearest aquarium?',
                        note: 'Measure to map icon',
                        icon: 'water'
                    },
                    {
                        title: 'Golf course',
                        question: 'Is your nearest golf course the same as my nearest golf course?',
                        note: 'Outdoor only, no mini/driving range, measure to map icon',
                        icon: 'golf_course'
                    }
                ]
            },
            {
                subcategory: 'Public Utilities',
                items: [
                    {
                        title: 'Hospital',
                        question: 'Is your nearest hospital the same as my nearest hospital?',
                        note: 'Measure to map icon',
                        icon: 'local_hospital'
                    },
                    {
                        title: 'Library',
                        question: 'Is your nearest library the same as my nearest library?',
                        note: 'Measure to map icon',
                        icon: 'local_library'
                    },
                    {
                        title: 'Foreign consulate',
                        question: 'Is your nearest foreign consulate the same as my nearest foreign consulate?',
                        note: 'Exclude honorary consulates, measure to map icon',
                        icon: 'account_balance'
                    }
                ]
            }
        ]
    },
    measuring: {
        color: '#4DA266',
        title: 'MEASURING',
        description: '"Compared to me, are you closer to or further from ___?"',
        badges: ['CLOSER / FURTHER', '5 min', 'Draw 3, keep 1'],
        answer: 'CLOSER or FURTHER',
        reward: 'Draw 3, keep 1',
        questions: [
            {
                subcategory: 'Transit-Related',
                items: [
                    {
                        title: 'Rail station',
                        question: 'Compared to me, are you closer to or further from a rail station?',
                        note: 'London Underground, DLR and National Rail count',
                        icon: 'train'
                    },
                    {
                        title: 'Commercial airport',
                        question: 'Compared to me, are you closer to or further from a commercial airport?',
                        note: 'Verify via Google Flights',
                        icon: 'flight'
                    },
                    {
                        title: 'High-speed train line',
                        question: 'Compared to me, are you closer to or further from a high-speed train line?',
                        note: 'i.e. GWR from Paddington; HS1 from St Pancras; ECML from King\'s Cross; WCML from Euston',
                        icon: 'directions_railway'
                    }
                ]
            },
            {
                subcategory: 'Borders & Administrative',
                items: [
                    {
                        title: 'London borough border',
                        question: 'Compared to me, are you closer to or further from a London Borough border?',
                        note: '',
                        icon: 'globe_uk'
                    },
                    {
                        title: 'Greater London boundary',
                        question: 'Compared to me, are you closer to or further from the Greater London boundary?',
                        note: '',
                        icon: 'crop_free'
                    }
                ]
            },
            {
                subcategory: 'Natural',
                items: [
                    {
                        title: 'Sea level',
                        question: 'Compared to me, are you closer to or further from sea level?',
                        answer: 'CLOSER, FURTHER, or AMBIGUOUS',
                        note: 'Your altitude; answer AMBIGUOUS if unclear/too similar (still counts)',
                        icon: 'altitude'
                    },
                    {
                        title: 'Body of water',
                        question: 'Compared to me, are you closer to or further from a body of water?',
                        note: 'Any named body, not pools',
                        icon: 'water'
                    },
                    {
                        title: 'Mountain',
                        question: 'Compared to me, are you closer to or further from a mountain?',
                        note: 'Measure to map icon',
                        icon: 'landscape'
                    },
                    {
                        title: 'Park',
                        question: 'Compared to me, are you closer to or further from a park?',
                        note: 'Measure to map icon (not boundary)',
                        icon: 'forest'
                    }
                ]
            },
            {
                subcategory: 'Places of Interest',
                items: [
                    {
                        title: 'Museum',
                        question: 'Compared to me, are you closer to or further from a museum?',
                        note: 'Measure to map icon',
                        icon: 'museum'
                    },
                    {
                        title: 'Cinema',
                        question: 'Compared to me, are you closer to or further from a cinema?',
                        note: 'Measure to map icon',
                        icon: 'movie'
                    },
                    {
                        title: 'Amusement park',
                        question: 'Compared to me, are you closer to or further from an amusement park?',
                        note: 'Measure to map icon',
                        icon: 'attractions'
                    },
                    {
                        title: 'Zoo',
                        question: 'Compared to me, are you closer to or further from a zoo?',
                        note: 'Measure to map icon',
                        icon: 'pets'
                    },
                    {
                        title: 'Aquarium',
                        question: 'Compared to me, are you closer to or further from an aquarium?',
                        note: 'Measure to map icon',
                        icon: 'water'
                    },
                    {
                        title: 'Golf course',
                        question: 'Compared to me, are you closer to or further from a golf course?',
                        note: 'Measure to map icon',
                        icon: 'golf_course'
                    }
                ]
            },
            {
                subcategory: 'Public Utilities',
                items: [
                    {
                        title: 'Hospital',
                        question: 'Compared to me, are you closer to or further from a hospital?',
                        note: 'Measure to map icon',
                        icon: 'local_hospital'
                    },
                    {
                        title: 'Library',
                        question: 'Compared to me, are you closer to or further from a library?',
                        note: 'Measure to map icon',
                        icon: 'local_library'
                    },
                    {
                        title: 'Foreign consulate',
                        question: 'Compared to me, are you closer to or further from a foreign consulate?',
                        note: 'Measure to map icon',
                        icon: 'account_balance'
                    }
                ]
            }
        ]
    },
    radar: {
        color: '#F6793C',
        title: 'RADAR',
        description: '"Are you within ___ of me?"',
        badges: ['YES / NO', '5 min', 'Draw 2, keep 1'],
        answer: 'YES or NO',
        reward: 'Draw 2, keep 1',
        note: 'Answer based on YOUR LOCATION, not your hiding zone',
        gridCols: 2,
        questions: [
            {
                items: [
                    {
                        title: '500m',
                        question: 'Are you within 500m of me?',
                        note: 'Answer based on YOUR location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '1km',
                        question: 'Are you within 1km of me?',
                        note: 'Answer based on YOUR location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '2km',
                        question: 'Are you within 2km of me?',
                        note: 'Answer based on YOUR location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '5km',
                        question: 'Are you within 5km of me?',
                        note: 'Answer based on YOUR location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '10km',
                        question: 'Are you within 10km of me?',
                        note: 'Answer based on YOUR location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '15km',
                        question: 'Are you within 15km of me?',
                        note: 'Answer based on YOUR location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '40km',
                        question: 'Are you within 40km of me?',
                        note: 'Answer based on YOUR location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '[DISTANCE]',
                        question: 'Are you within [DISTANCE] of me?',
                        note: 'Choose any distance. Answer based on YOUR location, not your hiding zone',
                        icon: 'my_location',
                        subtitle: 'any distance'
                    }
                ]
            }
        ]
    },
    thermometer: {
        color: '#FFBF40',
        title: 'THERMOMETER',
        description: '"After traveling ___, am I hotter or colder?"',
        badges: ['HOTTER / COLDER', '5 min', 'Draw 2, keep 1'],
        answer: 'HOTTER (closer) or COLDER (farther)',
        reward: 'Draw 2, keep 1',
        note: 'Measured as the crow flies. HOTTER = closer, COLDER = farther',
        questions: [
            {
                items: [
                    {
                        title: '1km',
                        question: 'After traveling 1km, am I hotter or colder?',
                        note: 'Measured as the crow flies from start to end point',
                        icon: 'thermostat'
                    },
                    {
                        title: '5km',
                        question: 'After traveling 5km, am I hotter or colder?',
                        note: 'Measured as the crow flies from start to end point',
                        icon: 'thermostat'
                    },
                    {
                        title: '15km',
                        question: 'After traveling 15km, am I hotter or colder?',
                        note: 'Measured as the crow flies from start to end point',
                        icon: 'thermostat'
                    }
                ]
            }
        ]
    },
    photo: {
        color: '#81B5CD',
        title: 'PHOTO',
        description: '"Send me a photo of ___"',
        badges: ['Photo / Cannot answer', '10 min', 'Draw 1, keep 1'],
        answer: "Photo or 'I cannot answer the question'",
        reward: 'Draw 1, keep 1',
        note: 'Normal phone aspect ratio. No Google Street View allowed. Hider can redact identifying text and logos.',
        questions: [
            {
                subcategory: 'Selfie & Environment',
                items: [
                    {
                        title: 'You (selfie)',
                        question: 'Send me a photo of you (selfie).',
                        note: 'Arm extended, phone perpendicular to ground, default lens',
                        icon: 'face'
                    },
                    {
                        title: 'Sky',
                        question: 'Send me a photo of the sky.',
                        note: 'Phone on ground, shoot up, default lens',
                        icon: 'cloud'
                    }
                ]
            },
            {
                subcategory: 'Structures & Buildings',
                items: [
                    {
                        title: 'Structure with highest elevation',
                        question: 'Send me a photo of the structure with highest elevation from your sightline.',
                        note: 'Include top + both sides, top in top 1/3 of frame',
                        icon: 'apartment'
                    },
                    {
                        title: 'Structure with highest elevation from station',
                        question: 'Send me a photo of the structure with highest elevation from the entrance of your station.',
                        note: "Your choice of entrance; top + both sides, top in top 1/3 of frame; station building doesn't count unless building above has separate purpose",
                        icon: 'domain'
                    },
                    {
                        title: 'Any building from station',
                        question: 'Send me a photo of any building from the entrance of your station.',
                        note: 'Your choice of entrance; roof + both sides, top in top 1/3 of frame',
                        icon: 'business'
                    },
                    {
                        title: '2 buildings',
                        question: 'Send me a photo of 2 buildings.',
                        note: 'Bottom to 4 stories',
                        icon: 'location_city'
                    }
                ]
            },
            {
                subcategory: 'Streets & Paths',
                items: [
                    {
                        title: 'Widest street',
                        question: 'Send me a photo of the widest street.',
                        note: 'Both sides visible',
                        icon: 'follow_the_signs'
                    },
                    {
                        title: 'Trace nearest street/path',
                        question: 'Send me a photo tracing the nearest street/path.',
                        note: 'Intersection to intersection, street/path on Google Maps',
                        icon: 'stylus_note'
                    }
                ]
            },
            {
                subcategory: 'Transit',
                items: [
                    {
                        title: 'Train platform',
                        question: 'Send me a photo of a train platform.',
                        note: '2m x 2m section, 3 distinct matchable elements',
                        icon: 'train'
                    }
                ]
            },
            {
                subcategory: 'Outdoor Features',
                items: [
                    {
                        title: 'Tree',
                        question: 'Send me a photo of a tree.',
                        note: 'Entire tree',
                        icon: 'nature'
                    },
                    {
                        title: 'Park',
                        question: 'Send me a photo of a park.',
                        note: 'No zoom, perpendicular, 2m from obstruction',
                        icon: 'forest'
                    },
                    {
                        title: 'Telephone box',
                        question: 'Send me a photo of a telephone box.',
                        note: 'Entire telephone box',
                        icon: 'phone'
                    }
                ]
            },
            {
                subcategory: 'Commercial & Services',
                items: [
                    {
                        title: 'Restaurant interior',
                        question: 'Send me a photo of a restaurant interior.',
                        note: 'Through window from outside, no zoom',
                        icon: 'restaurant'
                    },
                    {
                        title: 'Shop aisle',
                        question: 'Send me a photo of an aisle in a shop.',
                        note: 'From end, down aisle, no zoom',
                        icon: 'shopping_cart'
                    }
                ]
            }
        ]
    },
    tentacle: {
        color: '#9372AE',
        title: 'TENTACLE',
        description: '"Within ___ of me, which ___ are you nearest to?"',
        badges: ['Name / Not within reach', '5 min', 'Draw 4, keep 2'],
        answer: "Location name or 'Not within reach'",
        reward: 'Draw 4, keep 2',
        gridCols: 2,
        questions: [
            {
                subcategory: 'Within 2 km',
                items: [
                    {
                        title: 'Museums (2km)',
                        question: 'Within 2km of me, which museum are you nearest to?',
                        note: 'Within 2km of seeker',
                        icon: 'museum'
                    },
                    {
                        title: 'Libraries (2km)',
                        question: 'Within 2km of me, which library are you nearest to?',
                        note: 'Within 2km of seeker',
                        icon: 'local_library'
                    },
                    {
                        title: 'Cinemas (2km)',
                        question: 'Within 2km of me, which cinema are you nearest to?',
                        note: 'Within 2km of seeker',
                        icon: 'movie'
                    },
                    {
                        title: 'Hospitals (2km)',
                        question: 'Within 2km of me, which hospital are you nearest to?',
                        note: 'Within 2km of seeker',
                        icon: 'local_hospital'
                    }
                ]
            }
        ]
    }
};
