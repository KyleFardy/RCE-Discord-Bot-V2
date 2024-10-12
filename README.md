# 🌟 RCE Discord Bot V2

## 📜 Description

RCE Discord Bot V2 is a Rust Console Discord Bot Designed To Interact With Rust CE Servers Using The [rce.js](https://github.com/b1nzeex/rce.js) Library. This Bot Handles Various Events And Commands To Enhance The User Experience On Discord.

---

## 🚀 Features

- 🎮 **Real-Time Event Handling For Player Actions**
- 📊 **Logging Of Server Events**
- 👋 **Welcome Messages (Configurable)**
- 📬 **Automated Messages (Configurable)**
- 🌐 **Support For Multiple Events Like Airdrops, Cargo, Brad/Heli Downed, Raid Alarm And More**
- 🔄 **Automated Events (Configurable)**
- 📍 **Teleporting To Base/Outpost/Bandit Camp**
- ⚔️ **Kill Feeds (Configurable)**
- 📈 **Player Statistics (Via SQLite Or MySQL)**
- 🎁 **Random Items Every x Seconds (Configurable)**

---

## 📝 TODO

- 🔒 Offline Raid Protection
- 🛒 Discord/In Game Shop (Configurable)

---

## ⚙️ Installation

Follow These Steps To Set Up The Bot:

1. **Clone The Repository:**
    ```bash
    git clone https://github.com/KyleFardy/RCE-Discord-Bot-V2.git
    ```

2. **Navigate To The Project Directory:**
    ```bash
    cd RCE-Discord-Bot-V2
    ```

3. **Install The Dependencies:**
    ```bash
    npm install
    ```

4. **Create A `.env` File In The Root Directory And Add Your Configuration Variables:**
    ```env
    TOKEN=""
    CLIENT_ID=""
    GUILD_ID=""

    GPORTAL_EMAIL=""
    GPORTAL_PASSWORD=""

    DATABASE_TYPE="mysql"
    DATABASE_HOST="localhost"
    DATABASE_USER="root"
    DATABASE_PASSWORD=""
    DATABASE_NAME="rce_discord_bot"

    LOG_LEVEL="info"

    EMBED_COLOR="#e6361d"
    EMBED_FOOTER_TEXT="RCE Admin"
    EMBED_LOGO="https://cdn.void-dev.co/rust.png"

    WELCOME_MESSAGE="<br><size=40>Hello <color=orange>{{username}}</color>,<br>Welcome To <color=#03bcff>Metal Mayhem</color></size><br>Join Our Discord: <color=red><b>https://discord.gg/XFx6XXHnDA</b></color>"
    ```

5. **Add Your Servers:**
   - Run Command `/add` To Add A Server.  
   > When You Add A Server It Will Automatically Create The Linked Role And All The Channels For You!

6. **Run The Bot:**
    ```bash
    node index.js
    ```

---

## 🤝 Contributing

Contributions Are Welcome! If You Have Ideas Or Would Like To Implement Any Features, Please Feel Free To Submit A Pull Request.

---

## 🙏 Acknowledgments

- [rce.js](https://github.com/b1nzeex/rce.js) For The Connection Library.
- The Rust Community For Their Support And Feedback.
