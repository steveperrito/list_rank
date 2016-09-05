$(function(){
  var tableArea = $('.appendClone'),
    addToDoButton = $('.save'),
    sortButtons = $('.sort'),
    savedData = localStorage.getItem('ToDoList'),
    savedToDos = savedData ? JSON.parse(savedData) : [],
    myToDoList = new ToDoList(savedToDos);

  writeToDoList(tableArea, myToDoList.render('template'));

  //Listen for Item Add
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

    myToDoList
      .add(newToDo)
      .sortBy(null, 'markedDone')
      .save();

    writeToDoList(tableArea, myToDoList.render('template'), function(){
      toDoInput.val('');
      rankedClass.each(function(){
        $(this).removeClass('beenRated');
      })
    });
  });

  //Listen for and Handle Column Sorts
  sortButtons.click(function(){
    var btn = $(this);
    var column = btn.attr('data-attr');
    var currentSortDirection = btn.hasClass('glyphicon-sort-by-attributes') ? 'asc' : 'desc';
    var nextSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    var icons = {
      'asc' : 'glyphicon-sort-by-attributes',
      'desc' : 'glyphicon-sort-by-attributes-alt'
    };

    myToDoList
      .sortBy(column, nextSortDirection)
      .save();

    writeToDoList(tableArea, myToDoList.render('template'), function(){
      btn
        .removeClass(icons[currentSortDirection])
        .addClass(icons[nextSortDirection]);
    });

  });

  //Listen for and Handle Action Buttons
  tableArea.click(function(e){
    var action = $(e.target);

    //Delete To-Do.
    if (action.hasClass('rmvIt')) {
      var elementToDelete = action.attr('data-item');
      myToDoList
        .remove(elementToDelete)
        .save();

      writeToDoList(tableArea, myToDoList.render('template'));
    }

    //Mark To-Do Complete
    if (action.hasClass('glyphicon-ok-circle') && !action.hasClass('text-success')) {
      var completedToDo = action.attr('data-item');
      myToDoList
        .complete(completedToDo)
        .sortBy(null, 'markedDone')
        .save();

      writeToDoList(tableArea, myToDoList.render('template'));
    }

    //Mark To-Do Incomplete
    if (action.hasClass('glyphicon-ok-circle') && action.hasClass('text-success')) {
      var uncompletedToDo = action.attr('data-item');
      myToDoList
        .notComplete(uncompletedToDo)
        .sortBy(null, 'markedDone')
        .save();

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

      myToDoList
        .edit(toDoToUpdate, allEdits)
        .save();

      writeToDoList(tableArea, myToDoList.render('template'))
    }

    //Cancel Editing
    if (action.hasClass('cancel-edits')) {
      writeToDoList(tableArea, myToDoList.render('template'));
    }
  });

  /**
   * Updates or writes to-do list to dom and sets listeners for
   * future user interactions. Optional callback provided.
   *
   * @param container {jQuery} - HTML table body to which HTML is appended
   * @param HTML {String} - Table rows in html.
   * @param cb [Function] - Optional Callback function.
   */
  function writeToDoList(container, HTML, cb) {
    //Populate Table or Row
    container
      .empty()
      .html(HTML);

    //Activate Tool-tips
    activateToolTips($('[data-toggle="tooltip"]'));

    //Set listeners for rankings
    listenForRank($('.stars'));

    //Callback (if provided)
     if (cb) {
       cb();
     }
  }

  /**
   * Listens for ranking events. Can be called
   * multiple times for new Dom content.
   *
   * @param starWrapper {jQuery}
   */
  function listenForRank(starWrapper) {
    //Set 'Select Ranking' Listeners:
    starWrapper.on('mouseover', '.star', function(){
      var el = $(this);
      el.addClass('active');
      el.prevAll('.star').addClass('active');
    });

    starWrapper.on('mouseout', '.star', function() {
      var el = $(this);
      el.removeClass('active');
      el.prevAll('.star').removeClass('active');
    });

    starWrapper.on('click', '.star', function(){
      var el = $(this);
      //Clear previous rating.
      $('.beenRated').each(function(){
        $(this).removeClass('beenRated');
      });
      //Add current rating
      el.addClass('beenRated').removeClass('active');
      el.prevAll('.star').addClass('beenRated').removeClass('active');
    });
  }

  /**
   * Activates Bootstrap's tooltips. Can be called
   * multiple times for new Dom content.
   *
   * @param toolTips {jQuery}
   */
  function activateToolTips(toolTips) {
    /*$('[data-toggle="tooltip"]')*/

    toolTips.tooltip({
      template : '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
      delay: { "show": 1000, "hide": 100 }
    });
  }

});


/**
 * Model class handles most data manipulation.
 *
 * @param {Array} toDoItems - objects that represent one to-do item.
 * @constructor
 */
function ToDoList(toDoItems){
  var That = this;

  this.toDoItems = toDoItems.map(function(el){
    el.UID = That.generateID();
    return el;
  });
}

/**
 * Generates a unique ID, later used for 2-way binding
 * between Dom and Model.
 *
 * @returns {String}
 */
ToDoList.prototype.generateID = function() {
  return 'r' + Math.random().toString(36).substr(2, 9);
};

/**
 * Returns true if data saved to local storage
 *
 * @returns {Boolean}
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
 * Adds to-do item.
 *
 * @param itemObject {Object}
 * @returns {ToDoList}
 */
ToDoList.prototype.add = function(itemObject) {
  itemObject.UID = this.generateID();
  this.toDoItems.push(itemObject);

  return this;
};


/**
 * Deletes to-do item.
 *
 * @param itemUID {String}
 * @returns {ToDoList}
 */
ToDoList.prototype.remove = function(itemUID) {
  this.toDoItems = this.toDoItems.filter(function(el){
    return el.UID !== itemUID;
  });

  return this;
};

/**
 * Edits to-do item.
 *
 * @param itemUID {String}
 * @param edits {Object}
 * @returns {ToDoList}
 */
ToDoList.prototype.edit = function(itemUID, edits) {
  this.toDoItems = this.toDoItems.map(function(el){
    if (el.UID === itemUID) {
      for (var itemProperty in edits) {
        el[itemProperty] = edits[itemProperty];
      }
      return el;
    }
    return el;
  });

  return this;
};

/**
 * Marks to-do item complete.
 *
 * @param itemUID {String}
 * @returns {ToDoList}
 */
ToDoList.prototype.complete = function(itemUID) {
  this.toDoItems = this.toDoItems.map(function(el){
    if (el.UID == itemUID) {
      el.completed = true;
      return el;
    }

    return el;
  });

  return this;
};

/**
 * Marks to-do item incomplete.
 *
 * @param itemUID {String}
 * @returns {ToDoList}
 */
ToDoList.prototype.notComplete = function(itemUID) {
  this.toDoItems = this.toDoItems.map(function(el){
    if (el.UID == itemUID) {
      delete el.completed;
      return el;
    }

    return el;
  });

  return this;
};

/**
 * Returns HTML (table rows) with items listed
 *
 * @param templateID {String} - id of element (selected
 * with jQuery)
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
 *
 * @param templateID
 * @param itemUID
 */
ToDoList.prototype.renderEditable = function(templateID, itemUID) {
  var template = $('#' + templateID).html();
  var entryToEdit = this.toDoItems.filter(function(el){
    return el.UID == itemUID;
  });
  var view = {
    'items' : entryToEdit
  };

  return Mustache.render(template, view);
};

/**
 * Sorts entire to-do list. Saves changes.
 *
 * 'markedDone' settings sorts completed items ONLY to bottom of list.
 * 'asc' or 'desc' sorts first based on completed status, then by
 * ascending or descending order.
 *
 * @param attribute - the to-do attribute by which to sort list.
 * @param order - must be 'asc', 'desc', or 'markedDone'
 * @returns {ToDoList}
 */
ToDoList.prototype.sortBy = function(attribute, order) {
  if (order == 'asc') {
    this.toDoItems.sort(function(a,b){
      if (!a.completed && !b.completed) {
        if(a[attribute] < b[attribute]) return -1;
        if(a[attribute] > b[attribute]) return 1;
        return 0;
      }

      if(a.completed && !b.completed) {
        return 1;
      }

      return -1;

    });
  }

  if (order == 'desc') {
    this.toDoItems.sort(function(a,b){
      if (!a.completed && !b.completed) {
        if(a[attribute] > b[attribute]) return -1;
        if(a[attribute] < b[attribute]) return 1;
        return 0;
      }

      if(a.completed && !b.completed) {
        return 1;
      }

      return -1;
    });
  }

  if (order == 'markedDone') {
    this.toDoItems.sort(function(a,b){
      if(a.completed && !b.completed) return 1;
      if(!a.completed && b.completed) return -1;
      return 0;
    });
  }

  this.markFirstCompleted();
  return this;
};

/**
 * Marks the first completed item so that template renders a title
 * above all completed items.
 *
 * This only works if you are sorting completed items to the
 * bottom of the list.
 */
ToDoList.prototype.markFirstCompleted = function() {
  this.toDoItems = this.toDoItems.map(function(el){
    if (el.firstCompletedItem) {
      delete el.firstCompletedItem;
      return el
    }

    return el;
  });

  for (var i = 0; i<this.toDoItems.length; i++) {
    if (this.toDoItems[i].completed) {
      this.toDoItems[i].firstCompletedItem = true;
      break;
    }
  }
};