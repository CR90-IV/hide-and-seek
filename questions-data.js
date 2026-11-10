// Question data
//
// Each category has:
// - description: the question pattern, shown in the category band
// - badges: short tags for the answer type, time limit and reward
// - answer, time, reward: used in the copied message
// - rules: rules for the hider. Shown once on screen and added to every message
// - fill: a line the seekers fill in before they send. Items can override it
// - seekerNote: help for the person using the app. Shown on screen only
//
// Each item has a title, question, icon and optional note, fill and answer.
// The item note is shown on screen and added to the message.
//
// The copied message must hold all the information the hider needs to answer.

const PIN = 'Measure to the Google Maps pin, not the edge.';
const OUTSIDE = 'Ignore places outside the game area.';

const link = (href, text) =>
    `<a href="${href}" target="_blank" style="color: inherit; text-decoration: underline;">${text}</a>`;

const RIVER_MAP = `See the ${link('https://content.tfl.gov.uk/riverservices-map.pdf', 'river bus map')}.`;

export const questionsData = {
    matching: {
        color: '#232F41',
        textColor: '#ffffff', // Text and icon colour on the category colour (contrast 4.5:1 or more)
        icon: 'join',
        title: 'MATCHING',
        description: '"Is your nearest ___ the same as mine?"',
        badges: ['Yes or no', '5 minutes', 'Draw 3, keep 1'],
        answer: 'yes or no',
        time: '5 minutes',
        reward: 'Then draw 3 cards and keep 1.',
        fill: 'Mine is: [fill in]',
        rules: [
            OUTSIDE,
            'The question counts even if there is none in the game area.'
        ],
        questions: [
            {
                subcategory: 'Transport',
                items: [
                    {
                        title: 'Train service',
                        question: 'Does the train I am on stop at your station?',
                        fill: 'My train: [line] towards [last stop]',
                        icon: 'directions_transit'
                    },
                    {
                        title: 'Station name length',
                        question: "Is your station's name the same length as mine?",
                        fill: 'Mine is: [station name] ([number] characters)',
                        note: 'Count every letter, space and hyphen. Include the word "Station".',
                        icon: 'text_fields'
                    },
                    {
                        title: 'Night Tube service',
                        question: 'Does your station have the same Night Tube service as mine?',
                        fill: 'My station: [station name]',
                        note: `See the ${link('https://content.tfl.gov.uk/standard-night-tube-map.pdf', 'Night Tube map')}. Ignore short-term closures.`,
                        icon: 'owl'
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
                        note: RIVER_MAP,
                        icon: 'directions_boat'
                    },
                    {
                        title: 'Commercial airport',
                        question: 'Is your nearest commercial airport the same as mine?',
                        note: 'It must have flights on Google Flights.',
                        icon: 'flight'
                    }
                ]
            },
            {
                subcategory: 'Areas',
                items: [
                    {
                        title: 'London borough',
                        question: 'Is your London borough the same as mine?',
                        icon: 'globe_uk'
                    },
                    {
                        title: 'Postcode area',
                        question: 'Is your postcode area the same as mine?',
                        note: 'The area is the first letters. In WC2N 5DS, it is WC.',
                        icon: 'local_post_office'
                    },
                    {
                        title: 'Postcode district',
                        question: 'Is your postcode district the same as mine?',
                        note: 'The district is the first half. In WC2N 5DS, it is WC2N.',
                        icon: 'local_post_office'
                    }
                ]
            },
            {
                subcategory: 'Natural',
                items: [
                    {
                        title: 'Landmass',
                        question: 'Is your landmass the same as mine?',
                        note: `Land on each side of a river or canal is a different landmass. For example, the north and south banks of the Thames. See the ${link('https://canoelondon.com/wordpress/wp-content/uploads/2012/02/London_waterways.pdf', 'London waterways map')}.`,
                        icon: 'terrain'
                    },
                    {
                        title: 'Park',
                        question: 'Is your nearest park the same as mine?',
                        note: PIN,
                        icon: 'forest'
                    }
                ]
            },
            {
                subcategory: 'Streets',
                items: [
                    {
                        title: 'Street or path',
                        question: 'Is your nearest street or path the same as mine?',
                        note: 'A street ends where its name changes. "East" and "West" count as different names.',
                        icon: 'follow_the_signs'
                    }
                ]
            },
            {
                subcategory: 'Places to visit',
                items: [
                    {
                        title: 'Museum',
                        question: 'Is your nearest museum the same as mine?',
                        note: PIN,
                        icon: 'museum'
                    },
                    {
                        title: 'Cinema',
                        question: 'Is your nearest cinema the same as mine?',
                        note: PIN,
                        icon: 'movie'
                    },
                    {
                        title: 'Amusement park',
                        question: 'Is your nearest amusement park the same as mine?',
                        note: PIN,
                        icon: 'attractions'
                    },
                    {
                        title: 'Zoo',
                        question: 'Is your nearest zoo the same as mine?',
                        note: PIN,
                        icon: 'pets'
                    },
                    {
                        title: 'Aquarium',
                        question: 'Is your nearest aquarium the same as mine?',
                        note: PIN,
                        icon: 'water'
                    },
                    {
                        title: 'Golf course',
                        question: 'Is your nearest golf course the same as mine?',
                        note: `Full outdoor courses only. Not mini golf or driving ranges. ${PIN}`,
                        icon: 'golf_course'
                    }
                ]
            },
            {
                subcategory: 'Public services',
                items: [
                    {
                        title: 'Hospital',
                        question: 'Is your nearest hospital the same as mine?',
                        note: PIN,
                        icon: 'local_hospital'
                    },
                    {
                        title: 'Library',
                        question: 'Is your nearest library the same as mine?',
                        note: PIN,
                        icon: 'local_library'
                    },
                    {
                        title: 'Foreign consulate',
                        question: 'Is your nearest foreign consulate the same as mine?',
                        note: `Not honorary consulates. ${PIN}`,
                        icon: 'passport'
                    }
                ]
            }
        ]
    },
    measuring: {
        color: '#4DA266',
        textColor: '#0b0c0c', // Text and icon colour on the category colour (contrast 4.5:1 or more)
        icon: 'straighten',
        title: 'MEASURING',
        description: '"Compared to me, are you closer to or further from ___?"',
        badges: ['Closer or further', '5 minutes', 'Draw 3, keep 1'],
        answer: 'closer or further',
        time: '5 minutes',
        reward: 'Then draw 3 cards and keep 1.',
        fill: 'My distance to the nearest one: [distance]',
        rules: [OUTSIDE],
        questions: [
            {
                subcategory: 'Transport',
                items: [
                    {
                        title: 'Rail station',
                        question: 'Compared to me, are you closer to or further from a rail station?',
                        note: 'Tube, DLR and National Rail stations count.',
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
                        note: RIVER_MAP,
                        icon: 'directions_boat'
                    },
                    {
                        title: 'High-speed train line',
                        question: 'Compared to me, are you closer to or further from a high-speed train line?',
                        note: "This means the main lines out of Paddington, St Pancras, King's Cross and Euston.",
                        icon: 'directions_railway'
                    },
                    {
                        title: 'Commercial airport',
                        question: 'Compared to me, are you closer to or further from a commercial airport?',
                        note: 'It must have flights on Google Flights.',
                        icon: 'flight'
                    }
                ]
            },
            {
                subcategory: 'Borders',
                items: [
                    {
                        title: 'London borough border',
                        question: 'Compared to me, are you closer to or further from a London borough border?',
                        icon: 'globe_uk'
                    },
                    {
                        title: 'Greater London boundary',
                        question: 'Compared to me, are you closer to or further from the Greater London boundary?',
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
                        fill: 'My height above sea level: [metres]',
                        answer: 'closer, further, or "too close to tell"',
                        note: 'If the heights are too close to tell, say so. The question still counts.',
                        icon: 'altitude'
                    },
                    {
                        title: 'Body of water',
                        question: 'Compared to me, are you closer to or further from a body of water?',
                        note: 'Any water with a name on Google Maps. Not pools.',
                        icon: 'water'
                    },
                    {
                        title: 'Park',
                        question: 'Compared to me, are you closer to or further from a park?',
                        note: PIN,
                        icon: 'forest'
                    }
                ]
            },
            {
                subcategory: 'Places to visit',
                items: [
                    {
                        title: 'Museum',
                        question: 'Compared to me, are you closer to or further from a museum?',
                        note: PIN,
                        icon: 'museum'
                    },
                    {
                        title: 'Cinema',
                        question: 'Compared to me, are you closer to or further from a cinema?',
                        note: PIN,
                        icon: 'movie'
                    },
                    {
                        title: 'Amusement park',
                        question: 'Compared to me, are you closer to or further from an amusement park?',
                        note: PIN,
                        icon: 'attractions'
                    },
                    {
                        title: 'Zoo',
                        question: 'Compared to me, are you closer to or further from a zoo?',
                        note: PIN,
                        icon: 'pets'
                    },
                    {
                        title: 'Aquarium',
                        question: 'Compared to me, are you closer to or further from an aquarium?',
                        note: PIN,
                        icon: 'water'
                    },
                    {
                        title: 'Golf course',
                        question: 'Compared to me, are you closer to or further from a golf course?',
                        note: `Full outdoor courses only. Not mini golf or driving ranges. ${PIN}`,
                        icon: 'golf_course'
                    }
                ]
            },
            {
                subcategory: 'Public services',
                items: [
                    {
                        title: 'Hospital',
                        question: 'Compared to me, are you closer to or further from a hospital?',
                        note: PIN,
                        icon: 'local_hospital'
                    },
                    {
                        title: 'Library',
                        question: 'Compared to me, are you closer to or further from a library?',
                        note: PIN,
                        icon: 'local_library'
                    },
                    {
                        title: 'Foreign consulate',
                        question: 'Compared to me, are you closer to or further from a foreign consulate?',
                        note: `Not honorary consulates. ${PIN}`,
                        icon: 'passport'
                    }
                ]
            }
        ]
    },
    radar: {
        color: '#F6793C',
        textColor: '#0b0c0c', // Text and icon colour on the category colour (contrast 4.5:1 or more)
        icon: 'radar',
        title: 'RADAR',
        description: '"Are you within ___ of me?"',
        badges: ['Yes or no', '5 minutes', 'Draw 2, keep 1'],
        answer: 'yes or no',
        time: '5 minutes',
        reward: 'Then draw 2 cards and keep 1.',
        fill: 'I am at: [location]',
        rules: ['Answer for where you are now, not for your whole hiding zone.'],
        gridCols: 2,
        questions: [
            {
                items: [
                    { title: '500m', question: 'Are you within 500m of me?', icon: 'my_location' },
                    { title: '1km', question: 'Are you within 1km of me?', icon: 'my_location' },
                    { title: '2km', question: 'Are you within 2km of me?', icon: 'my_location' },
                    { title: '5km', question: 'Are you within 5km of me?', icon: 'my_location' },
                    { title: '10km', question: 'Are you within 10km of me?', icon: 'my_location' },
                    { title: '15km', question: 'Are you within 15km of me?', icon: 'my_location' },
                    { title: '40km', question: 'Are you within 40km of me?', icon: 'my_location' },
                    { title: 'Custom', question: 'Are you within [distance] of me?', icon: 'my_location' }
                ]
            }
        ]
    },
    thermometer: {
        color: '#FFBF40',
        textColor: '#0b0c0c', // Text and icon colour on the category colour (contrast 4.5:1 or more)
        icon: 'thermostat',
        title: 'THERMOMETER',
        description: '"We have travelled ___. Are we hotter or colder?"',
        badges: ['Hotter or colder', '5 minutes', 'Draw 2, keep 1'],
        answer: 'hotter (we are closer to you) or colder (we are further away)',
        time: '5 minutes',
        reward: 'Then draw 2 cards and keep 1.',
        fill: 'Start: [location]\nEnd: [location]',
        rules: ['Measure in a straight line from start to end.'],
        seekerNote: 'Select Start when you set off. Select End when you have travelled the distance.',
        questions: [
            {
                items: [
                    { title: '1km', question: 'We have travelled 1km. Are we hotter or colder?', icon: 'thermostat' },
                    { title: '5km', question: 'We have travelled 5km. Are we hotter or colder?', icon: 'thermostat' },
                    { title: '15km', question: 'We have travelled 15km. Are we hotter or colder?', icon: 'thermostat' }
                ]
            }
        ]
    },
    photo: {
        color: '#81B5CD',
        textColor: '#0b0c0c', // Text and icon colour on the category colour (contrast 4.5:1 or more)
        icon: 'photo_camera',
        title: 'PHOTO',
        description: '"Send a photo of ___."',
        badges: ['Photo', '10 minutes', 'Draw 1, keep 1'],
        answer: 'a photo, or "I cannot answer" if there is none in your hiding zone',
        time: '10 minutes',
        reward: 'Then draw 1 card and keep it.',
        rules: [
            "Use your phone's normal photo shape. Do not crop.",
            'Do not use Google Street View.',
            'You can cover names, signs and logos.'
        ],
        questions: [
            {
                subcategory: 'You and what is around you',
                items: [
                    {
                        title: 'Selfie',
                        question: 'Send a selfie.',
                        note: 'Hold the phone upright at arm\'s length. Use the 1x lens.',
                        icon: 'face'
                    },
                    {
                        title: 'Sky',
                        question: 'Send a photo of the sky.',
                        note: 'Put the phone flat on the ground, camera facing up. Use the 1x lens.',
                        icon: 'cloud'
                    },
                    {
                        title: 'Ground',
                        question: 'Send a photo of the ground.',
                        note: 'Hold the phone out at arm\'s length, camera facing straight down. Use the 1x lens.',
                        icon: 'grass'
                    }
                ]
            },
            {
                subcategory: 'Buildings',
                items: [
                    {
                        title: 'Tallest structure you can see',
                        question: 'Send a photo of the tallest-looking structure you can see.',
                        note: 'Tallest-looking means the one you look up at most. Show its top and both sides. Put the top in the top third of the photo.',
                        icon: 'apartment'
                    },
                    {
                        title: 'Tallest structure seen from station',
                        question: 'Stand at an entrance to your station. Send a photo of the tallest-looking structure you can see.',
                        note: 'You choose the entrance. Show its top and both sides. Put the top in the top third of the photo. The station does not count, unless the building above it has a different use.',
                        icon: 'domain'
                    },
                    {
                        title: 'Building seen from station',
                        question: 'Stand at an entrance to your station. Send a photo of any building you can see.',
                        note: 'You choose the entrance. Show its roof and both sides. Put the roof in the top third of the photo.',
                        icon: 'business'
                    },
                    {
                        title: '2 buildings',
                        question: 'Send a photo of 2 buildings.',
                        note: 'Show the bottom of both buildings and up to 4 storeys.',
                        icon: 'location_city'
                    }
                ]
            },
            {
                subcategory: 'Streets and paths',
                items: [
                    {
                        title: 'Widest street',
                        question: 'Send a photo of the widest street you can see.',
                        note: 'Show both sides of the street. It must be on Google Maps.',
                        icon: 'follow_the_signs'
                    },
                    {
                        title: 'Sketch of nearest street',
                        question: 'Send a sketch of your nearest street or path.',
                        note: 'Draw it from one junction to the next. It must be on Google Maps.',
                        icon: 'stylus_note'
                    }
                ]
            },
            {
                subcategory: 'Transport',
                items: [
                    {
                        title: 'Train platform',
                        question: 'Send a photo of a train platform.',
                        note: 'Show an area about 2m by 2m. Include 3 things the seekers could find and match.',
                        icon: 'train'
                    }
                ]
            },
            {
                subcategory: 'Outdoors',
                items: [
                    {
                        title: 'Tree',
                        question: 'Send a photo of a whole tree.',
                        icon: 'nature'
                    },
                    {
                        title: 'Park',
                        question: 'Send a photo of a park.',
                        note: 'Hold the phone upright. Do not zoom. Stand at least 2m from anything in the way.',
                        icon: 'forest'
                    },
                    {
                        title: 'Telephone box',
                        question: 'Send a photo of a whole telephone box.',
                        icon: 'phone'
                    }
                ]
            },
            {
                subcategory: 'Shops and restaurants',
                items: [
                    {
                        title: 'Restaurant inside',
                        question: 'Send a photo of the inside of a restaurant.',
                        note: 'Take it through a window from outside. Do not zoom.',
                        icon: 'restaurant'
                    },
                    {
                        title: 'Shop aisle',
                        question: 'Send a photo of an aisle in a shop.',
                        note: 'Stand at one end and point the camera down the aisle. Do not zoom.',
                        icon: 'shopping_cart'
                    }
                ]
            }
        ]
    },
    tentacle: {
        color: '#9372AE',
        textColor: '#0b0c0c', // Text and icon colour on the category colour (contrast 4.5:1 or more)
        icon: 'hub',
        title: 'TENTACLE',
        description: '"Of all the ___ within ___ of me, which are you closest to?"',
        badges: ['Place name', '5 minutes', 'Draw 4, keep 2'],
        answer: 'the name of the place, or "out of range" if you are not within that distance',
        time: '5 minutes',
        reward: 'Then draw 4 cards and keep 2.',
        fill: 'The places are: [list]',
        rules: [OUTSIDE],
        gridCols: 2,
        questions: [
            {
                subcategory: 'Within 2km',
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

// Old question keys mapped to new ones, so saved games keep their asked
// questions and history after a title changes. Format: "CATEGORY:Title".
export const renamedQuestions = {
    'MATCHING:Night tube status': 'MATCHING:Night Tube service',
    'PHOTO:You (selfie)': 'PHOTO:Selfie',
    'PHOTO:Structure with highest elevation in your sightline': 'PHOTO:Tallest structure you can see',
    'PHOTO:Structure with highest elevation from station': 'PHOTO:Tallest structure seen from station',
    'PHOTO:Any building visible from station': 'PHOTO:Building seen from station',
    'PHOTO:Trace nearest street/path': 'PHOTO:Sketch of nearest street',
    'PHOTO:Restaurant interior': 'PHOTO:Restaurant inside'
};
