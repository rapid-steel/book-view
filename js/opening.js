function Opening($el, mode, cover, direction, animation, speed, pageNames) {

  this.$el = $el;
  if (this.$el.css('position')!='relative' && this.$el.css('position')!='absolute')
    this.$el.css('position', 'relative');

  this.mode = mode;
  this.pageMax = pageNames.length - 1;
  this.cover = cover;
  this.direction = direction;
  this.animation = !!animation;
  this.speed = speed || 500;
  this.height = this.$el.height();
  this.scale = this.height? 2 : 1;

  this.$arrows = {
    prev: direction=='right'? this.$el.find('.to-left') : this.$el.find('.to-right'),
    next: direction=='right'? this.$el.find('.to-right') : this.$el.find('.to-left')
  };
  this.$arrows.prev.addClass('unactive');
  this.$numbers = this.$el.find('.numbers');
  this.$toPageInput = this.$el.find('.to-page input');
  this.$animation = this.$el.find('.animation');

  this.pages = [
    new Page(this.$el.find('.p1'), pageNames, cover && mode == 2? 1 : 0),
    new Page(this.$el.find('.p2'), pageNames, cover && mode == 2? 0 : 1)
  ];
  this.pages.forEach(function(page) {
    page.$el.addClass('page-' + mode);
    page.setSrc();
  });
  this.pages[0].$el.addClass(direction);
  this.pages[1].$el.addClass(direction == 'right' ? 'left' : 'right');

  if (mode==1)
    this.pages[1].$img.hide();
  else if (cover)
    this.pages[0].$img.hide();

  this.height = this.$el.height();

  if(!this.animation && this.$animation)
    this.$animation.addClass('unactive');
}

Opening.prototype.changeMode = function() {
  this.pages.forEach( function (page) { page.$el.toggleClass('page-2 page-1'); });
  if(this.mode==1) {
    this.mode = 2;
    this.flipPage(this.pages[0].pageNum);
  } else {
    this.mode = 1;
    if (this.cover && this.pages[1].pageNum == 0)
      this.pages[0].displayPage(0, 'show');
    this.pages[1].$img.hide();
  }
  this.setHeight();
  this.activateArrows();
  this.getPageNumber();
};

Opening.prototype.getPageNumber = function() {
  var string;
  if (this.mode == 1 || this.pages[1].pageNum < this.pages[0].pageNum && this.pages[1].pageNum != 0)
    string = this.pages[0].pageNum + 1;
  else if (this.pages[1].pageNum!=0)
    string = this.direction =='right'?
      ( this.pages[0].pageNum + 1 ) + ' - ' + ( this.pages[1].pageNum + 1 ) :
      ( this.pages[1].pageNum + 1 ) + ' - ' + ( this.pages[0].pageNum + 1 );
  else
    string = 1;
  this.$numbers.html(string);
};

Opening.prototype.toRight = function() {
  this.direction == 'left'?
    this.toPrev(): this.toNext();
};

Opening.prototype.toLeft = function() {
  this.direction == 'right'?
    this.toPrev(): this.toNext();
};

Opening.prototype.toPrev = function() {
  if(this.animation && this.pages[0].pageNum > 0  && this.pages[1].pageNum > 0)
    this.animatePrev();
  this.mode == 2?
    this.flipPage(this.pages[0].pageNum-2): this.pages[0].flipPage('back');
  this.activateArrows();
  this.getPageNumber();
};

Opening.prototype.toNext = function() {

  if(this.pages[0].pageNum + this.mode <= this.pageMax) {
    if(this.animation)
      this.animateNext();

    if(this.mode == 2) {
      this.pages[0].pageNum < this.pages[1].pageNum?
        this.flipPage(this.pages[0].pageNum+2): this.flipPage(this.pages[0].pageNum);
    } else
      this.pages[0].flipPage('next');

    this.activateArrows();
    this.getPageNumber();
  }
};

Opening.prototype.toPage = function() {
  var val = this.$toPageInput.val();

  if(val > 0 && val <= this.pageMax + 1) {
    this.mode == 1?
      this.pages[0].setSrc(val - 1): this.flipPage(val - 1);
    this.activateArrows();
    this.getPageNumber();
  }
};

Opening.prototype.flipPage = function(number) {
  number = (this.cover && number / 2 == Math.ceil(number / 2) && number > 0)
  || (!this.cover && number / 2 != Math.ceil(number / 2))? +number-1 : +number;

  if (!(this.cover && number <= 0)) {
    this.pages[0].displayPage(number, 'show');
    number < this.pageMax?
      this.pages[1].displayPage(number + 1, 'show'): this.pages[1].displayPage(number - 1, 'hide');
  } else {
    this.pages[0].displayPage(1, 'hide');
    this.pages[1].displayPage(0, 'show');
  }

  this.pages.forEach( function (page) {
    if (page.pageNames[page.pageNum + this.mode])
      $.get(page.pageNames[page.pageNum + this.mode]);
    if (page.pageNames[page.pageNum - this.mode])
      $.get(page.pageNames[page.pageNum - this.mode]);
  }, this);
};

Opening.prototype.switchAnimation = function() {
  this.animation = !this.animation;
  this.$animation.toggleClass('unactive');
};

Opening.prototype.animateNext = function() {
  var page = this.pages[this.mode-1];
  this.animateClone(page);
  if (this.mode==2)
    this.animateOriginal(this.pages[0], page.$img.css('width'));
};

Opening.prototype.animatePrev = function() {
  var page = this.pages[this.mode-1];
  if (this.mode==2)
    this.animateClone(this.pages[0]);
  this.animateOriginal(page, this.pages[0].$img.css('width'));
};

Opening.prototype.animateClone = function(page) {
  var $clone = page.$img.clone();

  $('.clone').remove();
  $clone.appendTo(page.$el.find('.wrapper'))
    .addClass('clone animate')
    .animate({'width': 0, 'opacity': 0.5}, this.speed, function() {
      $clone.remove();
    });
};

Opening.prototype.animateOriginal = function(page, width) {
  var $clone = page.$img.clone(),
  delay = this.mode==2? this.speed*0.8: 0;

  $clone.appendTo(page.$el.find('.wrapper'))
      .addClass('clone down');
  page.$img.css('width', 0).css('opacity', 0.5)
    .addClass('animate')
    .delay(delay)
    .animate({'width': width, 'opacity': 1}, this.speed, function() {
      page.$img.css('width', '').removeClass('animate');
      $('.clone').remove();
    });
};


Opening.prototype.activateArrows = function() {
  (this.pages[0].pageNum == this.pageMax || (this.mode==2 && this.pages[1].pageNum == this.pageMax))?
    this.$arrows.next.addClass('unactive'):  this.$arrows.next.removeClass('unactive');
  (this.pages[0].pageNum == 0 || (this.mode==2 && this.pages[1].pageNum == 0))?
    this.$arrows.prev.addClass('unactive') :  this.$arrows.prev.removeClass('unactive');
};

Opening.prototype.changeScale = function() {
  var oldscale = this.scale;
  this.scale = this.scale < 2 ? this.scale + 1 : 0;
  this.$el.removeClass('scale-' + oldscale);
  this.$el.addClass('scale-' + this.scale);
  this.setHeight();
};

Opening.prototype.setHeight = function() {
  var height = this.scale==0? this.height :
    this.pages[0].$el.height() >  this.pages[1].$el.height() || this.mode==1 ?
    this.pages[0].$el.height() :  this.pages[1].$el.height();
  this.$el.height(height);
};
