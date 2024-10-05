
const fs = require('fs');
const path = require('path'); 
function get_item_image(display_name) {
    const itemsPath = path.join(__dirname, 'items.json');
    const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    const item = items.find(item => item.displayName.toLowerCase() === display_name.toLowerCase());
    if (item) {
        return `https://void-dev.co/proxy?image=${item.shortName}`;
    } else {
        return "https://cdn.void-dev.co/rce.png"; // Return an error message if not found
    }
}

const response = get_item_image("Door Controller");
console.log(response);