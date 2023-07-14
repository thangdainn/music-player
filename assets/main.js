const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");
const timeStartSong = $(".progress-time .time-start");
const timeEndSong = $(".progress-time .time-end");
const listBtnVolume = $(".btn-volume");
const volume = $("#volume");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  isVolume: true,
  statusVolume: "",
  valueVolume: 0,

  songs: [
    {
      name: "Vanh Khuyen Nho",
      singer: "Liu Grace",
      path: "./assets/music/Vanh-Khuyen-Nho.mp3",
      image: "./assets/image/VanhKhuyenNho.jpg",
    },
    {
      name: "Phai Chang Em Da Yeu",
      singer: "Juky San",
      path: "./assets/music/Phai-Chang-Em-Da-Yeu.mp3",
      image: "./assets/image/PhaiChangEmDaYeu.jpg",
    },
    {
      name: "Phonics Song",
      singer: "Various Artists",
      path: "./assets/music/Phonics-Song.mp3",
      image: "./assets/image/PhonicsSong.jpg",
    },
    {
      name: "Say You Do",
      singer: "Tien Tien",
      path: "./assets/music/Say-You-Do.mp3",
      image: "./assets/image/SayYouDo.jpg",
    },
    {
      name: "Ve Que",
      singer: "Mikelodic",
      path: "./assets/music/Ve-Que.mp3",
      image: "./assets/image/VeQue.jpg",
    },
    {
      name: "Choi Nhu Tui My",
      singer: "Andree Right Hand",
      path: "./assets/music/Choi-Nhu-Tui-My.mp3",
      image: "./assets/image/ChoiNhuTuiMy.jpg",
    },
    {
      name: "Ben Tren Tang Lau",
      singer: "Tang Duy Tan",
      path: "./assets/music/Ben-Tren-Tang-Lau.mp3",
      image: "./assets/image/BenTrenTangLau.jpg",
    },
    {
      name: "Trong Suong",
      singer: "Minh Lai",
      path: "./assets/music/Trong-Suong.mp3",
      image: "./assets/image/TrongSuong.jpg",
    },
    {
      name: "Hot Shot",
      singer: "Dlow",
      path: "./assets/music/Hot-Shot.mp3",
      image: "./assets/image/HotShot.jpg",
    },
  ],
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
          <div class="song" data-index="${index}">
              <div class="thumb"
                  style="background-image: url('${song.image}')">
              </div>
              <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
              </div>
              <div class="option">
                  <i class="fas fa-ellipsis-h"></i>
              </div>
          </div>
      `;
    });
    playList.innerHTML = htmls.join("");
    $(".song").classList.add("active");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Xu ly CD quay/dung
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to/ thu nhỏ cd
    document.onscroll = () => {
      const scrollY = window.scrollY;
      const cdNewWidth = cdWidth - scrollY;
      cd.style.width = cdNewWidth > 0 ? cdNewWidth + "px" : 0;
      cd.style.opacity = cdNewWidth / cdWidth;
    };

    // Xử lý khi play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Xu ly khi song play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Xu ly khi song pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tien do bai hat thay doi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const lengthSong = Math.floor(audio.duration);
        timeEndSong.textContent = _this.convertTime(lengthSong);
        const progressPercent = (audio.currentTime / lengthSong) * 100;
        progress.value = progressPercent;
        timeStartSong.textContent = _this.convertTime(
          Math.floor(audio.currentTime)
        );
        _this.dynamicProgress(progress, progress.value);
      }
    };

    // Xu ly khi tua bai hat
    progress.addEventListener("input", function () {
      const seekTime = (progress.value / 100) * audio.duration;
      audio.currentTime = seekTime;
      _this.dynamicProgress(progress, progress.value);
    });

    // Xu ly khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.nextSong();
      }
      _this.restartCd(cdThumbAnimate);
      _this.scrollToActiveSong();
      audio.play();
    };

    // Xu ly khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.prevSong();
      }
      _this.restartCd(cdThumbAnimate);
      _this.scrollToActiveSong();
      audio.play();
    };

    // Xu ly khi on/off random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xu ly khi on/off repeat song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Xu ly next song khi ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Click vao play list
    playList.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      const optionsNode = e.target.closest(".song .option");
      if (songNode || optionsNode) {
        // Xu ly khi click vao song
        if (songNode) {
          _this.currentIndex = Number(songNode.getAttribute("data-index"));
          _this.loadCurrentSong();
          _this.restartCd(cdThumbAnimate);
          audio.play();
        }
        // Xu ly khi click vao options
        else {
          console.log(optionsNode);
        }
      }
    };

    // Xu ly khi click button volume
    listBtnVolume.onclick = function (e) {
      const btnMuteVolume = $(".btn-volume .mute.active");
      const volumeNode = e.target;
      const currentValue = volume.value;
      if (!btnMuteVolume) {
        _this.statusVolume = volumeNode;
        volumeNode.classList.remove("active");
        $(".btn-volume .mute").classList.add("active");
        _this.valueVolume = currentValue;
        volume.value = 0;
        audio.volume = 0;
        _this.dynamicProgress(volume, 0);
      } else {
        volumeNode.classList.remove("active");
        _this.statusVolume.classList.add("active");
        volume.value = _this.valueVolume;
        audio.volume = volume.value;
        _this.dynamicProgress(volume, _this.valueVolume * 100);
      }
    };

    // Xu li khi kéo giữ progress của volume
    _this.dynamicProgress(volume, volume.value * 100);
    volume.addEventListener("input", function () {
      let currentVolume = volume.value;
      _this.setVolume(currentVolume);
      _this.dynamicProgress(volume, currentVolume * 100);
    });
  },

  restartCd: function (animate) {
    animate.pause();
    animate.currentTime = 0;
    animate.play();
  },

  removeStatusVolume: function () {
    $(".btn-volume .active").classList.remove("active");
  },

  setVolume: function (value) {
    if (value == 0) {
      this.removeStatusVolume();
      $(".btn-volume .mute").classList.add("active");
      audio.volume = value;
    } else if (0.3 > value) {
      this.removeStatusVolume();
      $(".btn-volume .low").classList.add("active");
      audio.volume = value;
    } else if (0.6 > value) {
      this.removeStatusVolume();
      $(".btn-volume .medium").classList.add("active");
      audio.volume = value;
    } else if (1 >= value) {
      this.removeStatusVolume();
      $(".btn-volume .big").classList.add("active");
      audio.volume = value;
    }
  },

  convertTime: function (lengthSong) {
    if (lengthSong >= 60) {
      let minute = Math.floor(lengthSong / 60);
      let second = lengthSong - minute * 60;
      let convert;
      if (second < 10) {
        convert = minute + ":0" + second;
      } else {
        convert = minute + ":" + second;
      }
      return convert;
    } else {
      let convert;
      if (lengthSong < 10) {
        convert = "0:0" + lengthSong;
      } else {
        convert = "0:" + lengthSong;
      }
      return convert;
    }
  },

  dynamicProgress: function (element, value) {
    const progressStyle = `linear-gradient(to right, #53ce67 0%, #53ce67 ${value}%, #fff ${value}%, #fff 100%)`;
    element.style.background = progressStyle;
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({ behavior: "smooth", block: "end" });
    }, 200);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
    let currentSongPlay = this.listSong()[this.currentIndex];
    $(".song.active").classList.remove("active");
    currentSongPlay.classList.add("active");
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  randomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  listSong: function () {
    return $$(".song");
  },

  start: function () {
    // Định nghĩa các thuộc tính
    this.defineProperties();

    // Render playlist
    this.render();

    // Xử lý các sự kiện
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi start app
    this.loadCurrentSong();
  },
};

app.start();
