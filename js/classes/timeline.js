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

class Timeline
{
	constructor(width, height, video, fps)
	{
		this.duration = video.duration.roundTo(3);
		this.video = video;
		this.width = width;
        this.height = height;
        this.fps = fps;
        this.frameSkip = 1;
		this.frameTime = (1/this.fps).roundTo(3);
		this.frameCount =  Math.floor(this.duration / this.frameTime);
        this.currentTime = 0;
        this.currentFrame = 0;
        this.lastFrame = -1;
        this.direction = "forward";
        this.savedTime = 0;
        this.seekSaved = false;
		this.startFrame = 0;
        this.endFrame = 1;
        this.callbacks = {};
		this.frames = [
            new Frame(this, 0, 0)
        ];
        this.activeFrames = [];
    }
    // function to fire "loaded" event
    createFrames()
    {
        var counter = 1;
        for(var time = this.frameTime; time <= (this.video.duration); time = (time + this.frameTime).roundTo(3))
        {
            this.frames[counter] = new Frame(this, time, counter);
            counter++;
        }
    }
    trigger(events, argArray=[])
    {
        events = events.split(",");
        for(var i = 0; i < events.length; i++)
        {
            let event = events[i].trim();
            if(this.callbacks[event] !== undefined)
            {
                for(var j = 0; j < this.callbacks[event].length; j++)
                {
                    this.callbacks[event][j].call(this, argArray);
                }
            }
        }
    }
    on(events, callback)
    {
        events = events.split(",");
        for(var i = 0; i < events.length; i++)
        {
            let event = events[i].trim();
            if(this.callbacks[event] === undefined)
            {
                this.callbacks[event] = [];
            }
            this.callbacks[event].push(callback);
        }
    }
    detectFrameRate(callback=null)
    {
        let lastTime = 0;
        let frame = null;
        let frameTime = 1/240;
        let difference = 0;
        let tempVideo = document.createElement("video");
        let timeline = this;
        var newFrames = 0;
        var firstLoad = true;
        tempVideo.onloadeddata = function(){
            if(firstLoad)
            {
                firstLoad = false;
                tempVideo.currentTime = tempVideo.duration;
                var newCanv = document.createElement("canvas");
                newCanv.height = tempVideo.videoHeight;
                newCanv.width = tempVideo.videoWidth;
                var newCtx = newCanv.getContext("2d");
                newCtx.drawImage(tempVideo, 0, 0, newCanv.width, newCanv.height);
                
                var tempTime = 0;
                tempVideo.currentTime = tempTime;
                let startFrame = newCanv.toDataURL();
                console.log("Detecting Framerate...");
                var matchCount = 0;
                var startFrameTime = 0;
                tempVideo.addEventListener("timeupdate", function(){
                    newCtx.drawImage(tempVideo, 0, 0, newCanv.width, newCanv.height);
                    if(tempTime == 0)
                        startFrame = newCanv.toDataURL();
                    
                    frame = newCanv.toDataURL();

                    if(frame !== startFrame && matchCount == 0)
                    {
                        startFrameTime = tempTime;
                        startFrame = frame;
                        tempTime += frameTime;
                        matchCount++;
                        tempVideo.currentTime = tempTime;
                    }
                    else if(frame !== startFrame && matchCount == 1)
                    {                        
                        matchCount++;
                        //(1/2510)
                        var framerate = ((tempVideo.duration / (tempTime - startFrameTime))/tempVideo.duration).roundTo(2);

                        // For some reason firefox, not chrome, reads 30fps videos as 34.29 fps
                        if(platform.name == "Firefox" && framerate == 34.29)
                            framerate = 30;
                        console.log(framerate + " FPS");
                        if(callback !== null)
                            callback(framerate);
                    }
                    else
                    {
                        tempTime += frameTime;
                        tempVideo.currentTime = tempTime;
                    }
                });
            }
        }
        tempVideo.src = this.video.src;
    }
    currentImage()
    {
        return this.getImage();
    }
    getImage(time=this.currentTime)
    {
        var lastTime = this.currentTime;
        this.video.currentTime = time;
        var canvas = document.createElement('canvas');
        canvas.height = this.video.videoHeight;
        canvas.width = this.video.videoWidth;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        var img = new Image();
        img.src = canvas.toDataURL();
        this.video.currentTime = lastTime;
        return img;
    }
    play(callback=null, options={})
    {
        if(this.playInterval == undefined)
        {
            this.trigger("play");
            var loop = true;
            var startingTime = this.currentTime;
            var startingFrame = this.startFrame;
            var endingFrame = this.endFrame;
            var frameSkip = this.frameSkip;
            var speed = 1;

            for(var key in options)
            {
                let value = options[key];
                switch(key)
                {
                    case "loop":
                        loop = value;
                        break;
                    case "startTime":
                    case "startingTime":
                        if(value > 0 && value < this.duration)
                            startingTime = value;
                        break;
                    case "startFrame":
                    case "startingFrame":
                        if(value >= 0 && value < this.frameCount)
                            startingFrame = value;
                        break;
                    case "endFrame":
                    case "endingFrame":
                        if(value > 0 && value <= this.frameCount)
                            endingFrame = value;
                        break;
                }
            }

            this.currentTime = startingTime;
            var counter = startingFrame;
            var timeline = this;

            this.playInterval = setInterval(function(){
                if(counter <= endingFrame)
                {
                    let next = timeline.next();
                    if(next !== false)
                    {
                        timeline.setFrame(next.number);
                        counter = next.number;
                        if(counter == endingFrame)
                            counter = endingFrame + 100;
                    }
                }
                else
                {
                    timeline.setFrame(startingFrame);
                    counter = startingFrame;
                }
                timeline.project.updateVisiblePoints();
                if(timeline.project.track !== undefined && timeline.project.track !== null)
                {
                    if(timeline.project.track.points[timeline.currentFrame] !== undefined)
                    {
                        timeline.project.track.unemphasizeAll();
                        timeline.project.track.points[timeline.currentFrame].emphasize();
                    }
                }
            }, 200 / speed);
        }
    }
    pause()
    {
        clearInterval(this.playInterval);
        this.playInterval = undefined;
        this.trigger("pause");
    }
    seek(frame)
    {
        this.savedFrame = frame;
        this.seekSaved = true;

        return this;
    }
    update()
    {
        if(this.seekSaved && this.duration > 0)
        {
            this.lastFrame = this.currentFrame;
            this.currentFrame = this.savedFrame;
            this.seekSaved = false;

            if(this.lastFrame < this.currentFrame)
                this.direction = "forward";
            else
                this.direction = "backward";
            
            this.currentTime = (this.currentFrame * this.frameTime).roundTo(3);

            this.trigger("seek");
        }
        else
            this.currentTime = (this.currentFrame * this.frameTime).roundTo(3);
        
        if(this.video.currentTime != this.currentTime)
        {
            this.video.currentTime = this.currentTime;
        }
    }
    updateTiming(duration, fps)
    {
        let ratios = {
            start: (this.startFrame / this.frameCount) || 0,
            end: (this.endFrame / this.frameCount) || 1
        };
		this.duration = duration.roundTo(3);
        this.fps = parseFloat(fps);
		this.frameTime = (1/this.fps).roundTo(3);
        this.frameCount =  Math.floor(this.duration / this.frameTime);
		this.duration = (this.frameCount * this.frameTime).roundTo(3);
        this.startFrame = Math.floor(ratios.start * this.frameCount);
        this.endFrame = Math.floor(ratios.end * this.frameCount);
        this.trigger("timingUpdate");
		return this.duration;
	}
	current()
	{
		if(this.frames[this.currentFrame] !== undefined)
		{
			return this.frames[this.currentFrame];
		}
		else
		{
			return false;
		}
	}
	setFrame(frameNum)
	{
		let frame = this.frames[frameNum];
		if(frame !== undefined)
		{
            this.lastFrame = this.currentFrame;
            this.currentFrame = frame.number;
			this.currentTime = frame.time.roundTo(3);
            this.video.currentTime = frame.time;

            if(this.lastFrame < this.currentFrame)
                this.direction = "forward";
            else
                this.direction = "backward";

            this.trigger("seek");
		}
		else
		{
			return false;
		}
    }
    getClosestFrame(time=this.currentTime)
    {
        return Math.floor((time / this.frameTime).roundTo(3));
    }
    getFrameStart(frameNum)
    {
        return (this.frameTime * frameNum).roundTo(3);
    }
	next()
	{
        var nextFrameNum = this.currentFrame + this.frameSkip;
        if(this.currentFrame % this.frameSkip !== 0)
        {
            nextFrameNum -= (this.currentFrame % this.frameSkip);
        }

        if(nextFrameNum > this.endFrame)
        {
            nextFrameNum = this.endFrame;
        }

        var pickedFrame = this.frames[nextFrameNum];
		if(pickedFrame == undefined)
		{
			return false;
		}
		else
		{
			return pickedFrame;
		}
	}
	prev()
	{
        var prevFrameNum = this.currentFrame - this.frameSkip;
        if(this.currentFrame % this.frameSkip !== 0)
        {
            prevFrameNum += this.frameSkip - (this.currentFrame % this.frameSkip);
        }

        if(prevFrameNum < this.startFrame)
        {
            prevFrameNum = this.currentFrame - (this.frameCount % this.frameSkip);
        }

        var pickedFrame = this.frames[prevFrameNum];
		if(pickedFrame == undefined)
		{
			return false;
		}
		else
		{
			return pickedFrame;
		}
	}
}