describe('Popup component', function() {
  var dialog;
  var titleText = 'title';
 
  beforeEach(function() {
    dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
    dialog.show(titleText, 'content');
  });

  afterEach(function() {
    dialog.close(true);
  });
  
  it('should be defined', function(){
    expect(dialog).toBeDefined();
  });

  it('should be found in DOM', function(){
    var popup = jQuery('div.divmanazerpopup');
    expect(popup.length).toEqual(1);
  });

  it('should have a title', function() {
    var popup = jQuery('div.divmanazerpopup');
    var title = popup.find('h3').html();
    expect(title).not.toBeNull();
    expect(title).toEqual('title'); // dialog.getTitle()
  });

	it('should fail', function() {
		if (jQuery.browser.msie) {
			expect(true).toBe(true);
		} else {
            console.log('testing...');
			expect(true).toBe(false);
		}
	})
});