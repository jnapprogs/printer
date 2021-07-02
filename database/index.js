const database = {
    users: {
        1: {
            "id": 1,
            "name": "Zach Oligschlaeger",
            "printers": [3, 4]
        },
        2: {
            "id": 2,
            "name": "Ben Baltes",
            "printers": [1]
        },
        3: {
            "id": 3,
            "name": "Jenn Chin",
            "printers": [2]
        },
        4: {
            "id": 4,
            "name": "Queen Elizabeth"
        }
    },
    printers: {
        1: {
            "id": 1,
            "name": "Ben’s Printer"
        },
        2: {
            "id": 2,
            "name": "Jenn’s Printer"
        },
        3: {
            "id": 3,
            "name": "Zach’s Printer 1"
        },
        4: {
            "id": 4,
            "name": "Zach’s Printer 2"
        }
    }
}

module.exports = database;
