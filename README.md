# RCE Discord Bot V2

## Description

RCE Discord Bot V2 is a Rust Console Discord Bot Designed To Interact With Rust CE Servers Using The [rce.js](https://github.com/b1nzeex/rce.js) Library. This Bot Handles Various Events And Commands To Enhance The User Experience On Discord

## Features

- Real-Time Event Handling For Player Actions
- Logging Of Server Events
- Customized Welcome Messages
- Automated Messages
- Support For Multiple Events Like Airdrops, Cargo, And More
- Automated Events
- Teleporting
- Kill Feeds
- Player Statistics (Via SQLite Or MySQL)
- Random Items Every x Seconds (Configurable)

## TODO

- Offline Raid Protection
- Discord/In Game Shop

## Installation

1. Clone The Repository:
    ```bash
    git clone https://github.com/KyleFardy/RCE-Discord-Bot-V2.git
    ```

2. Navigate To The Project Directory:
    ```bash
    cd RCE-Discord-Bot-V2
    ```

3. Install The Dependencies:
    ```bash
    npm install
    ```

4. Create A `.env` File In The Root Directory And Add Your Configuration Variables:
    ```env
    TOKEN="YOUR_DISCORD_BOT_TOKEN"
    CLIENT_ID="YOUR_CLIENT_ID"
    GUILD_ID="YOUR_GUILD_ID"
    GPORTAL_EMAIL="YOUR_GPORTAL_EMAIL"
    GPORTAL_PASSWORD="YOUR_GPORTAL_PASSWORD"
    DATABASE_TYPE="mysql"
    DATABASE_HOST="localhost"
    DATABASE_USER="root"
    DATABASE_PASSWORD=""
    DATABASE_NAME="rce_discord_bot"
    LOG_LEVEL="info"
    WELCOME_MESSAGE="<br><size=40>Hello <color=orange>{{username}}</color>,<br>Welcome To The Server!</size>"
    ```

5. Add Your Servers:
    ```json
    [
        {
            "identifier": "MM1",
            "region": "EU",
            "serverId": 6479404,
            "refreshPlayers": 2
        },
        {
            "identifier": "MM2",
            "region": "EU",
            "serverId": 6831535,
            "refreshPlayers": 2
        }
    ]
    ```


6. Run The Bot:
    ```bash
    node index.js
    ```

## Contributing

Contributions Are Welcome! If You Have Ideas Or Would Like To Implement Any Features, Please Feel Free To Submit A Pull Request

## Acknowledgments

- [rce.js](https://github.com/b1nzeex/rce.js) For The Connection Library
- The Rust Community For Their Support And Feedback
