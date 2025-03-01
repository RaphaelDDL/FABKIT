import fs from 'fs';

function getFiles(dir, files_) {
    files_ = files_ || [];
    const files = fs.readdirSync(dir);
    for (const i in files) {
        const name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            if (name.search(".png") !== -1) {
                files_.push(name);
            }
        }
    }
    return files_;
}

let res = {};

getFiles('public/img/cardbacks').forEach((file) => {
    let path = file.replace("public/img/cardbacks", "");
    const sub1re = /^\/(.*)?\/(.*.png)$/;
    let sub1match = path.match(sub1re);
    let [sub1, sub2] = sub1match[1].split('/');
    if (sub2) {
        if (!res[sub1]) {
            res[sub1] = {};
        }
        if (!res[sub1][sub2]) {
            res[sub1][sub2] = [];
        }
        res[sub1][sub2].push('img/cardbacks/' + sub1match[1] + '/' + sub1match[2]);
        return;
    }
    if (!res[sub1]) {
        res[sub1] = [];
    }
    if(!res[sub1][1]) {
        res[sub1][1] = [];
    }
    res[sub1][1].push('img/cardbacks/' + sub1match[1] + '/' + sub1match[2]);
})
const backgrounds = `const backgrounds = ${JSON.stringify(res)};
export function useBackgrounds() {
    return backgrounds;
}`;

export default backgrounds;