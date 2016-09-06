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

    //Add Item
    addToDo(newToDo, toDoInput, rankedClass);
  });

  //Listen for and Handle Column Sorts
  sortButtons.click(function(){
    var btn = $(this);
    var column = btn.attr('data-attr');
    var currentSortDirection = btn.hasClass('glyphicon-sort-by-attributes') ? 'asc' : 'desc';
    var nextSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';

    //Sort Column
    sortColumn(btn, column, currentSortDirection, nextSortDirection);
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
        .sortByStatus()
        .markFirstCompleted()
        .save();

      writeToDoList(tableArea, myToDoList.render('template'));
    }

    //Mark To-Do Incomplete
    if (action.hasClass('glyphicon-ok-circle') && action.hasClass('text-success')) {
      var uncompletedToDo = action.attr('data-item');
      myToDoList
        .notComplete(uncompletedToDo)
        .sortByStatus()
        .markFirstCompleted()
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

  /**
   * Adds to-do item to class and writes table
   *
   * @param newToDo {Object}
   * @param toDoInput {jQuery}
   * @param rankedClass {jQuery}
   */
  function addToDo(newToDo, toDoInput, rankedClass) {

    myToDoList
      .add(newToDo)
      .sortByStatus()
      .markFirstCompleted()
      .save();

    writeToDoList(tableArea, myToDoList.render('template'), function(){
      toDoInput.val('');
      rankedClass.each(function(){
        $(this).removeClass('beenRated');
      })
    });
  }

  /**
   * Sorts to-do list by column and writes table.
   *
   * @param btn {jQuery}
   * @param column {String} - 'item' or 'rank'
   * @param currentSortDirection {String} - 'asc' or 'desc'
   * @param nextSortDirection {String} - 'asc' or 'des'
   */
  function sortColumn(btn, column, currentSortDirection, nextSortDirection) {
    var icons = {
      'asc' : 'glyphicon-sort-by-attributes',
      'desc' : 'glyphicon-sort-by-attributes-alt'
    };

    myToDoList
      .sortBy(column, nextSortDirection)
      .sortByStatus()
      .markFirstCompleted()
      .save();

    writeToDoList(tableArea, myToDoList.render('template'), function(){
      btn
        .removeClass(icons[currentSortDirection])
        .addClass(icons[nextSortDirection]);
    });
  }

});