jQuery.prototype.book = function(params) {
  var pageNames = [],
    controls = params.controls? params.controls.split(' ') : false,
    keys = {
      mode: 'Change display mode: Tab',
      scale: 'Change scale: Space',
      arrows: 'Change page: ArrowLeft/Right',
      'to-page': 'Type number and press Enter'
    },
    keyActions = {
      9: 'changeMode',   //Tab
      32: 'changeScale', //Space
      37: 'toLeft', //ArrowLeft
      39: 'toRight' //ArrowRight
  };

  if(params.mask&&params.type&&params.end)
    for(var i = params.start || 1; i<=params.end; i++)
      pageNames.push(params.folder + params.mask.slice(0,-i.toString().length) + i + '.' + params.type);
  else if (params.list) {
    pageNames = params.list;
    if(params.folder)
      pageNames.forEach(function(item) {
        item = params.folder + item;
      });
  }

  $(this).append(bookCode);

  if(params.controls)
    $(this).find('.controls').show();

  if(controls) {
    controls.forEach(function(item) {
      $(this).find('.' + item).show();
      if(params.keys) $(this).find('.' + item).attr('title', keys[item]);
      if(item=='to-page') $(this).find('.pages-sum span').html(pageNames.length);
    }, this);
  }

  var opening = new Opening($(this), !params.mode || params.mode==1 ?  1 : 2, params.cover, params.direction || 'right', params.animation, params.speed, pageNames);

  opening.getPageNumber();
  opening.changeScale();

  if (params.decoration)
    opening.$el.addClass(params.decoration);

  $(this).on('click', function(event) {
    var $target = $(event.target);

    if($target.hasClass('page') || $target.parent().hasClass('wrapper'))
      event.clientX - $(this).offset().left < $(this).width()/2?
        opening.toLeft(): opening.toRight();

      if (!$target.hasClass('unactive')) {
        if($target.hasClass('to-left')) opening.toLeft();
        if($target.hasClass('to-right')) opening.toRight();
      }
    if($target.hasClass('mode') || $target.parent().hasClass('mode'))
      opening.changeMode();
    if($target.hasClass('scale') || $target.parent().hasClass('scale'))
      opening.changeScale();
    if($target.hasClass('animation') || $target.parent().hasClass('animation'))
      opening.switchAnimation();
    if($target.hasClass('to-page-arrow'))
      opening.toPage();
  });

  $(this).find('.to-page input').on('keydown', function(event) {
    if(event.keyCode==13 && parseInt($(event.target).val()))
      opening.toPage();
  });

  if (params.keys)
    $(document).on('keydown', function(event) {

      if(keyActions[event.keyCode])
        opening[keyActions[event.keyCode]]();

  });

};