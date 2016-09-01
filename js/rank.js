$(function(){
  var tableArea = $('.appendClone');
  var addToDoButton = $('.save');
  var sortButton = $('.sort');
  var savedData = localStorage.getItem('ToDoList');
  var savedToDos = savedData ? JSON.parse(savedData) : [];
  var myToDoList = new ToDoList(savedToDos);

  writeToDoList(tableArea, myToDoList.render('template'));

  //Listen for item add
  addToDoButton.click(function(e){
    e.preventDefault();
    var toDoInput = $('#to-do-item');
    var toDoItem = toDoInput.val();
    var rankedClass = $('.beenRated');
    var itemRank = rankedClass.length;
    var newToDo = {
      item : toDoItem,
      rank : itemRank
    };

    myToDoList.add(newToDo);
    writeToDoList(tableArea, myToDoList.render('template'), function(){
      toDoInput.val('');
      rankedClass.each(function(){
        $(this).removeClass('beenRated');
      })
    });
  });

  //Listen for sort
  sortButton.click(function(){
    var btn = $(this);
    var column = btn.attr('data-attr');
    var currentSortDirection = btn.hasClass('glyphicon-sort-by-attributes') ? 'asc' : 'desc';
    var nextSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    var icons = {
      'asc' : 'glyphicon-sort-by-attributes',
      'desc' : 'glyphicon-sort-by-attributes-alt'
    };

    myToDoList.sortBy(column, nextSortDirection);
    writeToDoList(tableArea, myToDoList.render('template'), function(){
      btn.removeClass(icons[currentSortDirection]).addClass(icons[nextSortDirection]);
    });

  });

  //Listen for action buttons
  tableArea.click(function(e){
    var action = $(e.target);

    //Delete To-Do.
    if (action.hasClass('rmvIt')) {
      var elementToDelte = action.attr('data-item');
      myToDoList.remove(elementToDelte);
      writeToDoList(tableArea, myToDoList.render('template'));
    }

    //Mark To-Do Complete
    if (action.hasClass('glyphicon-ok-circle') && !action.hasClass('text-success')) {
      var completedToDo = action.attr('data-item');
      myToDoList.complete(completedToDo);
      writeToDoList(tableArea, myToDoList.render('template'));
    }

    //Mark To-Do Uncomplete
    if (action.hasClass('glyphicon-ok-circle') && action.hasClass('text-success')) {
      var uncompletedToDo = action.attr('data-item');
      myToDoList.notComplete(uncompletedToDo);
      writeToDoList(tableArea, myToDoList.render('template'));
    }

    //Make To-Do Editable
    if (action.hasClass('glyphicon-edit')) {
      var toDoToEdit = action.attr('data-item');
      var toDoRow = $('#' + toDoToEdit);
      writeToDoList(toDoRow, myToDoList.renderEditable('edit-row', toDoToEdit));
    }

    //Save Edits
    if (action.hasClass('glyphicon-save')) {
      var toDoToUpdate = action.attr('data-item');
      var itemToUpdate = $('#item-' + toDoToUpdate).val();
      var rankingToUpdate = $('#stars-' + toDoToUpdate).find('.beenRated').length;
      var allEdits = {
        'item' : itemToUpdate,
        'rank' : rankingToUpdate
      };

      myToDoList.edit(toDoToUpdate, allEdits);
      writeToDoList(tableArea, myToDoList.render('template'))
    }
  });

  /**
   *
   * @param container
   * @param HTML
   * @param cb
   */
  function writeToDoList(container, HTML, cb) {
    //Populate table or row
    container
      .empty()
      .html(HTML);

    //activate tool-tips
    $('[data-toggle="tooltip"]').tooltip({
      template : '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
      delay: { "show": 1500, "hide": 100 }
    });

    //Select Ranking Listeners:
    $('.stars').on('mouseover', '.star', function(){
      var el = $(this);
      el.addClass('active');
      el.prevAll('.star').addClass('active');
    });

    $('.stars').on('mouseout', '.star', function() {
      var el = $(this);
      el.removeClass('active');
      el.prevAll('.star').removeClass('active');
    });

    $('.stars').on('click', '.star', function(){
      var el = $(this);
      //Clear previous rating.
      $('.beenRated').each(function(){
        $(this).removeClass('beenRated');
      });
      //Add current rating
      el.addClass('beenRated').removeClass('active');
      el.prevAll('.star').addClass('beenRated').removeClass('active');
    });

    //Callback if provided
     if (cb) {
       cb();
     }
  }

});


/**
 * Model class handles most data manipulation.
 * @param {array} toDoItems - objects that represent one to-do item.
 * @constructor
 */
function ToDoList(toDoItems){
  var That = this;

  this.toDoItems = toDoItems.map(function(el, i, ary){
    el.UID = That.generateID();
    return el;
  });
}

/**
 * Generates a unique ID, later used 2-way binding between
 * Dom and Model.
 * @returns {string}
 */
ToDoList.prototype.generateID = function() {
  return 'r' + Math.random().toString(36).substr(2, 9);
};

/**
 * Returns true if data saved to local storage
 * Error not handled right now, just thrown.
 * @returns {boolean}
 */
ToDoList.prototype.save = function(){
  try {
    localStorage.setItem('ToDoList', JSON.stringify(this.toDoItems));
  }
  catch(e){
    throw e;
  }

  return true;
};

/**
 * Adds to-do item. Saves changes.
 * @param itemObject
 * @returns {boolean}
 */
ToDoList.prototype.add = function(itemObject) {
  itemObject.UID = this.generateID();
  this.toDoItems.push(itemObject);

  return this.save();
};


/**
 * Deletes to-do item. Saves changes.
 * @param itemUID
 * @returns {boolean}
 */
ToDoList.prototype.remove = function(itemUID) {
  this.toDoItems = this.toDoItems.filter(function(el, i, ary){
    return el.UID !== itemUID;
  });

  return this.save();
};

/**
 * Edits to-do item. Saves changes.
 * @param itemUID
 * @param edits
 * @returns {boolean}
 */
ToDoList.prototype.edit = function(itemUID, edits) {
  this.toDoItems = this.toDoItems.map(function(el, i, ary){
    if (el.UID === itemUID) {
      for (var itemProperty in edits) {
        el[itemProperty] = edits[itemProperty];
      }
      return el;
    }
    return el;
  });

  return this.save();
};

/**
 * Marks to-do item complete. Saves changes.
 * @param itemUID
 * @returns {boolean}
 */
ToDoList.prototype.complete = function(itemUID) {
  this.toDoItems = this.toDoItems.map(function(el, i, ary){
    if (el.UID == itemUID) {
      el.completed = true;
      return el;
    }

    return el;
  });

  return this.save();
};

/**
 * Marks to-do item incomplete. Saves changes.
 * @param itemUID
 * @returns {boolean}
 */
ToDoList.prototype.notComplete = function(itemUID) {
  this.toDoItems = this.toDoItems.map(function(el, i, ary){
    if (el.UID == itemUID) {
      delete el.completed;
      return el;
    }

    return el;
  });

  return this.save();
};

/**
 * Returns HTML (table rows) with items listed
 * @param templateID - id of element (selected with jQuery)
 */
ToDoList.prototype.render = function(templateID){
  var template = $('#' + templateID).html();
  var view = {
    'items' : this.toDoItems,
    'ranking' : function() {
      var stars = '';
      for (var i = 0;i< this.rank;i++) {
        stars += '<span class="glyphicon glyphicon-star gold"></span>';
      }

      return stars;
    }
  };

  return Mustache.render(template, view);
};

/**
 * Renders HTML for to-do item editing.
 * @param templateID
 * @param itemUID
 */
ToDoList.prototype.renderEditable = function(templateID, itemUID) {
  var template = $('#' + templateID).html();
  var entryToEdit = this.toDoItems.filter(function(el, i, ary){
    return el.UID == itemUID;
  });
  var view = {
    'items' : entryToEdit
  };

  return Mustache.render(template, view);
};

/**
 * Sorts entire to-do list. Saves changes.
 * @param attribute - the to-do attribute by which to sort list.
 * @param order - must be 'asc' or 'desc'
 * @returns {boolean}
 */
ToDoList.prototype.sortBy = function(attribute, order) {
  if (order == 'asc') {
    this.toDoItems.sort(function(a,b){
      /*if(a.completed && b.completed) return 0;
      if(a.completed && !b.completed) return -1;*/
      if(a[attribute] < b[attribute]) return -1;
      if(a[attribute] > b[attribute]) return 1;
      return 0;
    });
  }

  if (order == 'desc') {
    this.toDoItems.sort(function(a,b){
      /*if(b.completed) return -1;
      if(a.completed) return -1;*/
      if(a[attribute] > b[attribute]) return -1;
      if(a[attribute] < b[attribute]) return 1;
      return 0;
    });
  }

  return this.save();
};