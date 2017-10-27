function Page($el, pNames, pNum) {
  this.$el = $el;
  this.$img = this.$el.find('img');
  this.pageNum = pNum;
  this.pageMax = pNames.length;
  this.pageNames = pNames;
}

Page.prototype.setSrc = function(number) {
  this.pageNum = number!=undefined? number : this.pageNum;
  this.$img.attr('src', this.pageNames[this.pageNum]);
};

Page.prototype.displayPage = function(number, display) {
  this.setSrc(number);
  if(display == 'show')
    this.$img.css('display', 'inline-block');
  else
    this.$img.hide();
};

Page.prototype.flipPage = function(direction) {
  this.pageNum = direction == 'next' && +this.pageNum + 1 < this.pageMax ?
    +this.pageNum + 1 : this.pageNum;
  this.pageNum = direction == 'back' && this.pageNum > 0 ?
    +this.pageNum - 1 : this.pageNum;
  this.setSrc();
};
