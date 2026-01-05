// Question data structure
const questionsData = {
    matching: {
        color: '#232F41',
        title: 'MATCHING',
        description: '"Is your nearest ___ the same as my ___?"',
        badges: ['YES / NO', '5 min', 'Draw 3, keep 1'],
        answer: 'YES or NO',
        reward: 'Draw 3, keep 1',
        note: "Seekers should say which item is their nearest. Treat locations outside map boundaries as if they don't exist. A null answer still counts and the hider still draws.",
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
                        question: "Is the length of your station's name the same as mine?",
                        note: "Count all characters including hyphens/spaces/'station'",
                        icon: 'text_fields'
                    },
                    {
                        title: 'Bus stop',
                        question: 'Is your nearest bus stop the same as mine?',
                        icon: 'directions_bus'
                    },
                    {
                        title: 'Cycle docking station',
                        question: 'Is your nearest Santander Cycles docking station the same as mine?',
                        icon: 'pedal_bike'
                    },
                    {
                        title: 'River bus pier',
                        question: 'Is your nearest river bus pier the same as mine?',
                        note: 'See <a href="https://content.tfl.gov.uk/riverservices-map.pdf" target="_blank" style="color: inherit; text-decoration: underline;">map of London river services</a>.',
                        icon: 'directions_boat'
                    },
                    {
                        title: 'Commercial airport',
                        question: 'Is your nearest commercial airport the same as mine?',
                        note: 'Verify via Google Flights',
                        icon: 'flight'
                    }
                ]
            },
            {
                subcategory: 'Administrative',
                items: [
                    {
                        title: 'London borough',
                        question: 'Is your London Borough the same as mine?',
                        note: '',
                        icon: 'globe_uk'
                    },
                    {
                        title: 'Postcode area',
                        question: 'Is your postcode area the same as mine?',
                        note: 'e.g. [WC]2N 5DS',
                        icon: 'local_post_office'
                    },
                    {
                        title: 'Postcode district',
                        question: 'Is your postcode district the same as mine?',
                        note: 'e.g. [WC2]N 5DS',
                        icon: 'local_post_office'
                    },
                    {
                        title: 'Postcode subdistrict',
                        question: 'Is your postcode subdistrict the same as mine?',
                        note: 'e.g. [WC2N] 5DS',
                        icon: 'local_post_office'
                    },
                    {
                        title: 'Postcode sector',
                        question: 'Is your postcode sector the same as mine?',
                        note: 'e.g. [WC2N 5]DS',
                        icon: 'local_post_office'
                    },
                    {
                        title: 'TfL fare zone',
                        question: "Is your station's fare zone the same as mine?",
                        note: 'YES if stations share any zones',
                        icon: 'transit_ticket'
                    },
                ]
            },
            {
                subcategory: 'Natural',
                items: [
                    {
                        title: 'Landmass',
                        question: 'Is your landmass the same as mine?',
                        note: 'See <a href="https://canoelondon.com/wordpress/wp-content/uploads/2012/02/London_waterways.pdf" target="_blank" style="color: inherit; text-decoration: underline;">map of London waterways</a>; e.g. opposite banks of Thames are separate landmasses',
                        icon: 'terrain'
                    },
                    {
                        title: 'Park',
                        question: 'Is your nearest park the same as mine?',
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
                        question: 'Is your nearest street or path the same as mineh?',
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
                        question: 'Is your nearest museum the same as mine?',
                        note: 'Measure to map icon',
                        icon: 'museum'
                    },
                    {
                        title: 'Cinema',
                        question: 'Is your nearest cinema the same as mine?',
                        note: 'Measure to map icon',
                        icon: 'movie'
                    },
                    {
                        title: 'Amusement park',
                        question: 'Is your nearest amusement park the same as mine?',
                        note: 'Measure to map icon',
                        icon: 'attractions'
                    },
                    {
                        title: 'Zoo',
                        question: 'Is your nearest zoo the same as mine?',
                        note: 'Measure to map icon',
                        icon: 'pets'
                    },
                    {
                        title: 'Aquarium',
                        question: 'Is your nearest aquarium the same as mine?',
                        note: 'Measure to map icon',
                        icon: 'water'
                    },
                    {
                        title: 'Golf course',
                        question: 'Is your nearest golf course the same as mine?',
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
                        question: 'Is your nearest hospital the same as mine?',
                        note: 'Measure to map icon',
                        icon: 'local_hospital'
                    },
                    {
                        title: 'Library',
                        question: 'Is your nearest library the same as mine?',
                        note: 'Measure to map icon',
                        icon: 'local_library'
                    },
                    {
                        title: 'Foreign consulate',
                        question: 'Is your nearest foreign consulate the same as mine?',
                        note: 'Exclude honorary consulates, measure to map icon',
                        icon: 'passport'
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
        note: "Seekers should say how far they are from the relevant item.",
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
                        title: 'Bus stop',
                        question: 'Compared to me, are you closer to or further from a bus stop?',
                        icon: 'directions_bus'
                    },
                    {
                        title: 'Cycle docking station',
                        question: 'Compared to me, are you closer to or further from a Santander Cycles docking station?',
                        icon: 'pedal_bike'
                    },
                    {
                        title: 'River bus pier',
                        question: 'Compared to me, are you closer to or further from a river bus pier?',
                        icon: 'directions_boat'
                    },
                    {
                        title: 'High-speed train line',
                        question: 'Compared to me, are you closer to or further from a high-speed train line?',
                        note: 'i.e. GWR from Paddington; HS1 from St Pancras; ECML from King\'s Cross; WCML from Euston',
                        icon: 'directions_railway'
                    },
                    {
                        title: 'Commercial airport',
                        question: 'Compared to me, are you closer to or further from a commercial airport?',
                        note: 'Verify via Google Flights',
                        icon: 'flight'
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
                        note: 'i.e. your altitude; answer AMBIGUOUS if unclear/too similar (still counts)',
                        icon: 'altitude'
                    },
                    {
                        title: 'Body of water',
                        question: 'Compared to me, are you closer to or further from a body of water?',
                        note: 'Any named body on Google Maps, not pools',
                        icon: 'water'
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
                        icon: 'passport'
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
        note: 'Hiders answer based on their location, not your hiding zone',
        gridCols: 2,
        questions: [
            {
                items: [
                    {
                        title: '500m',
                        question: 'Are you within 500m of me?',
                        note: 'Answer based on your location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '1km',
                        question: 'Are you within 1km of me?',
                        note: 'Answer based on your location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '2km',
                        question: 'Are you within 2km of me?',
                        note: 'Answer based on your location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '5km',
                        question: 'Are you within 5km of me?',
                        note: 'Answer based on your location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '10km',
                        question: 'Are you within 10km of me?',
                        note: 'Answer based on your location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '15km',
                        question: 'Are you within 15km of me?',
                        note: 'Answer based on your location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: '40km',
                        question: 'Are you within 40km of me?',
                        note: 'Answer based on your location, not your hiding zone',
                        icon: 'my_location'
                    },
                    {
                        title: 'Custom',
                        question: 'Are you within [DISTANCE] of me?',
                        note: 'Answer based on your location, not your hiding zone',
                        icon: 'my_location',
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
        note: 'Seekers say when they are starting a thermometer. When ending a thermometer, seekers provide their start and end locations. Distance measured as the crow flies.',
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
        description: '"Send a photo of ___"',
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
                        question: 'Send a photo of you (selfie).',
                        note: 'Arm extended, phone perpendicular to ground, default lens',
                        icon: 'face'
                    },
                    {
                        title: 'Sky',
                        question: 'Send a photo of the sky.',
                        note: 'Phone on ground, facing directly up, default lens',
                        icon: 'cloud'
                    },
                    {
                        title: 'Ground',
                        question: 'Send a photo of the ground.',
                        note: 'Phone at arm level, facing directly down, default lens',
                        icon: 'grass'
                    }
                ]
            },
            {
                subcategory: 'Structures & Buildings',
                items: [
                    {
                        title: 'Structure with highest elevation in your sightline',
                        question: 'Send a photo of the structure with highest angle of elevation from your sightline.',
                        note: 'Include top + both sides, top in top 1/3 of frame',
                        icon: 'apartment'
                    },
                    {
                        title: 'Structure with highest elevation from station',
                        question: 'Send a photo of the structure with highest angle of elevation from an entrance of your station.',
                        note: "Your choice of entrance; top + both sides, top in top 1/3 of frame; station building doesn't count unless building above has separate purpose",
                        icon: 'domain'
                    },
                    {
                        title: 'Any building visible from station',
                        question: 'Send a photo of any building from the entrance of your station.',
                        note: 'Your choice of entrance; roof + both sides, top in top 1/3 of frame',
                        icon: 'business'
                    },
                    {
                        title: '2 buildings',
                        question: 'Send a photo of 2 buildings.',
                        note: 'Bottom and to 4 stories',
                        icon: 'location_city'
                    }
                ]
            },
            {
                subcategory: 'Streets & Paths',
                items: [
                    {
                        title: 'Widest street',
                        question: 'Send a photo of the widest street.',
                        note: 'Both sides of the street visible. Street/path visible on Google Maps.',
                        icon: 'follow_the_signs'
                    },
                    {
                        title: 'Trace nearest street/path',
                        question: 'Send a sketch of the nearest street/path.',
                        note: 'Intersection to intersection. Street/path visible on Google Maps',
                        icon: 'stylus_note'
                    }
                ]
            },
            {
                subcategory: 'Transit',
                items: [
                    {
                        title: 'Train platform',
                        question: 'Send a photo of a train platform.',
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
                        question: 'Send a photo of an entire tree.',
                        note: '',
                        icon: 'nature'
                    },
                    {
                        title: 'Park',
                        question: 'Send a photo of a park.',
                        note: 'No zoom, perpendicular to ground, 2m from obstruction',
                        icon: 'forest'
                    },
                    {
                        title: 'Telephone box',
                        question: 'Send a photo of an entire telephone box.',
                        note: '',
                        icon: 'phone'
                    }
                ]
            },
            {
                subcategory: 'Commercial & Services',
                items: [
                    {
                        title: 'Restaurant interior',
                        question: 'Send a photo of a restaurant interior.',
                        note: 'Through window from outside, no zoom',
                        icon: 'restaurant'
                    },
                    {
                        title: 'Shop aisle',
                        question: 'Send a photo of an aisle in a shop.',
                        note: 'From end of aisle shooting down, no zoom',
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
        note: 'Seekers should send a list of locations for the hider to choose from.',
        questions: [
            {
                subcategory: 'Within 2 km',
                items: [
                    {
                        title: 'Museums (2km)',
                        question: 'Of all the museums within 2km of me, which are you closest to?',
                        icon: 'museum'
                    },
                    {
                        title: 'Libraries (2km)',
                        question: 'Of all the libraries within 2km of me, which are you closest to?',
                        icon: 'local_library'
                    },
                    {
                        title: 'Cinemas (2km)',
                        question: 'Of all the cinemas within 2km of me, which are you closest to?',
                        icon: 'movie'
                    },
                    {
                        title: 'Hospitals (2km)',
                        question: 'Of all the hospitals within 2km of me, which are you closest to?',
                        icon: 'local_hospital'
                    }
                ]
            }
        ]
    }
};
