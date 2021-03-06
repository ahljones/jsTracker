/**
 * jsTrack: web-based Tracker (https://physlets.org/tracker/). Get position data from objects in a video.
 * Copyright (C) 2018 Luca Demian
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * Contact:
 * 
 * Luca Demian
 * jstrack.luca@gmail.com
 * 
 */

if (!Array.prototype.last){
	Array.prototype.last = function(){
		return this[this.length - 1];
	}
}
if (!Number.prototype.roundTo){
	Number.prototype.roundTo = function(x){
		return parseFloat(parseFloat(this).toFixed(x));
	}
}
if (!Number.prototype.roundSig){
	Number.prototype.roundSig = function(x){
		return parseFloat(parseFloat(this).toPrecision(x));
	}
}
if (!String.prototype.roundTo){
	String.prototype.roundTo = function(x){
		return parseFloat(parseFloat(this).toFixed(x));
	}
}
if (!Number.prototype.toDegrees){
	Number.prototype.toDegrees = function(){
		return this * (180 / Math.PI);
	}
}
if (!Number.prototype.toRadians){
	Number.prototype.toRadians = function(){
		return this * (Math.PI / 180);
	}
}
if (!Number.prototype.sigFigs){
	Number.prototype.sigFigs = function(){
        let log10 = Math.log(10);
        let n = Math.abs(String(this).replace(".", ""));
        if (n == 0) return 0;
        while (n != 0 && n % 10 == 0) n /= 10;
        
        return Math.floor(Math.log(n) / log10) + 1;
    }
}
if (!String.prototype.sigFigs){
	String.prototype.sigFigs = function(){
        let log10 = Math.log(10);
        let n = Math.abs(String(this).replace(".", ""));
        if (n == 0) return 0;
        while (n != 0 && n % 10 == 0) n /= 10;
        
        return Math.floor(Math.log(n) / log10) + 1;
    }
}
if(!Math.cot)
{
    Math.cot = function(number){
        return (1 / Math.tan(number));
    }
}
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};
if(!String.prototype.utf8Length)
{
    String.prototype.utf8Length = function() {
        var m = encodeURIComponent(this).match(/%[89ABab]/g);
        return this.length + (m ? m.length : 0);
    }
}

function hideLoader()
{
    document.getElementById("fullscreen-loader").classList.remove("active");
}

function showLoader()
{
    document.getElementById("fullscreen-loader").classList.add("active");
    // setTimeout(hideLoader, 10000);
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function isQuotaExceeded(e) {
    var quotaExceeded = false;
    if (e) {
        if (e.code) {
            switch (e.code) {
                case 22:
                    quotaExceeded = true;
                    break;
                case 1014:
                    // Firefox
                    if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                        quotaExceeded = true;
                    }
                    break;
            }
        }
        else if (e.number === -2147024882) {
            // Internet Explorer 8
            quotaExceeded = true;
        }
    }
    return quotaExceeded;
}

function compareImages(img1,img2){
    if(img1.data.length != img2.data.length)
        return false;
    for(var i = 0; i < img1.data.length; ++i){
        if(img1.data[i] != img2.data[i])
            return false;
    }
    return true;   
 }


