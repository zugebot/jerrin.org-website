function getVersion() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './latest.json', false);
    xhr.send();
    var fileContents = xhr.responseText;
    var firstLine = fileContents.split(/\r?\n/)[0];
    return firstLine;
}
function parseVersion(string, version) {
    var result = string.replace(/\{\}/g, version);
    return result;
}        
        
function formatLink(link) {
    var version = getVersion();
    return parseVersion(link, version);
}

function addClick(button, link) {
    button.addEventListener("click", () => {
        download = formatLink(link);
        window.open(download, '_self');
        console.log("fortnite");
    });
}

function prepareButtons() {
    btn1 = document.getElementById("btn1");
    addClick(btn1, "versions/{}/JRT_windows_{}.exe");
    btn2 = document.getElementById("btn2");
    addClick(btn2, "versions/{}/JRT_debian_{}.deb");
    btn3 = document.getElementById("btn3");
    //addClick(btn3, "versions/{}/JRT_linux_{}.tar.gz");
    //btn4 = document.getElementById("btn4");
    addClick(btn4, "versions/{}/JRT_mac_{}.dmg");
}
    