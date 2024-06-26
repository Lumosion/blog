class Barrage {
    constructor(comments) {
        this.comments = comments;
        this.dom = document.querySelector(".comment-barrage");
        this.barrageList = [];
        this.barrageIndex = 0;
        this.barrageTimer = [];
        this.hoverOnCommentBarrage = false;
        this.init();
    }

    filterAndFlatten = (comments) => {
        return (comments.flatMap(comment => comment.replies ? [comment, ...this.filterAndFlatten(comment.replies)] : [comment]))
    }

    sanitizeContent(content) {
        return content.replace(/(<([^>]+)>)/ig, '').trim();
    }

    createBarrageItem(comment) {
        const content = this.sanitizeContent(comment.content);
        if (!content) return false;
        const element = document.createElement("div");
        element.className = "comment-barrage-item";
        element.innerHTML = `<div class="barrageHead"><a class="barrageTitle" href="javascript:sco.scrollTo('post-comment')">${GLOBAL_CONFIG.lang.barrage.title}</a><div class="barrageNick">${comment.nick}</div><img class="barrageAvatar" src="${GLOBAL_CONFIG.comment.avatar}/avatar/${comment.mailMd5}"/><a class="comment-barrage-close" href="javascript:sco.switchCommentBarrage();"><i class="solitude st-close-fill"></i></a></div><a class="barrageContent" href="${comment.id ? `javascript:sco.scrollTo(\'${comment.id}\')` : 'javascript:sco.scrollTo(\'post-comment\')'}">${content}</a>`;
        this.dom.appendChild(element);
        this.barrageTimer.push(element);
        return true;
    }

    removeBarrageItem(element) {
        element.classList.add("out");
        setTimeout(() => this.dom.removeChild(element), 1000);
    }

    manageBarrage() {
        if (this.barrageList.length && !this.hoverOnCommentBarrage) {
            if (!this.createBarrageItem(this.barrageList[this.barrageIndex])) {
                this.barrageIndex = (this.barrageIndex + 1) % this.barrageList.length;
                return this.manageBarrage();
            }
            this.barrageIndex = (this.barrageIndex + 1) % this.barrageList.length;
        }
        if (this.barrageTimer.length > Math.min(1, this.barrageList.length) && !this.hoverOnCommentBarrage) {
            this.removeBarrageItem(this.barrageTimer.shift());
        }
    }

    initBarrage() {
        const storageSwitch = utils.saveToLocal.get("commentBarrageSwitch");
        this.dom.style.display = storageSwitch ? "flex" : "none";
        this.barrageList = this.filterAndFlatten(this.comments);
        this.dom.innerHTML = "";
        clearInterval(this.commentInterval);
        this.commentInterval = setInterval(() => this.manageBarrage(), 5000);
    }

    init() {
        this.initBarrage();
        this.dom.addEventListener('mouseover', () => this.hoverOnCommentBarrage = true);
        this.dom.addEventListener('mouseout', () => this.hoverOnCommentBarrage = false);
    }

    destroy() {
        clearInterval(this.commentInterval);
        this.dom.removeEventListener('mouseover', () => this.hoverOnCommentBarrage = true)
        this.dom.removeEventListener('mouseout', () => this.hoverOnCommentBarrage = false)
        this.dom.innerHTML = ""
    }
}

function initializeCommentBarrage(array) {
    if (array.length === 0) return;
    let existingBarrage = window.currentBarrage;
    if (existingBarrage) existingBarrage.destroy();
    window.currentBarrage = new Barrage(array);
}