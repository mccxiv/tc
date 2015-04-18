angular.module('tc').filter('emotify', function() {
	
	/**
	 * Takes the emotes object and replaces occurrences in the
	 * message with img tags to display them. 
	 * 
	 * Input format is: {id : [range, range]}
	 * 
	 * Eg.
	 * {
	 *   '2197': [ '0-5', '19-24' ],
	 *   '16720': [ '7-17' ]
	 * }
	 * 
	 * Internal breakdown ===========================================
	 * 
	 * 1) Re-organize the emotes in new format
	 * 2) Sort by beginIndex, greatest to smallest
	 * 3) For each occurrence
	 *        3.1) escape and store substring from emote end to end of `line` in `output`
	 *        3.2) store the emote in `output` array
	 *        3.3) store substring from 0 to emote start in `line`
	 * 4) escape and store `line` in `output`
	 * 5) reverse `output`
	 * 
	 * New format: [ [(string)id, (int)beginIndex, (int)endIndex] ]
	 * 
	 * Eg.
	 * [
	 *   ['2197', 19, 24],
	 *   ['16720', 7, 17],
	 *   ['2197', 0, 5]
	 * ]
	 *  
	 */
	
	function escape(html) {
		return String(html)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}
	
	function imgEmote(id) {
		return '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/'+id+'/1.0">';
	}
	
	return function(message, emotes) {
		
		emotes = emotes || {};
		var line = message || '';
		var occurrences = [];
		var output = [];
		
		// 1
		Object.keys(emotes).forEach(function(emoteKey) {
			emotes[emoteKey].forEach(function(occurrence) {
				var indexes = occurrence.split('-');
				if (indexes.length === 2) {
					occurrences.push([emoteKey, Number(indexes[0]), Number(indexes[1])]);
				}
			});
		});
		
		// 2
		occurrences.sort(function(a, b) {
			if (a[1] < b[1]) return -1;
			if (a[1] > b[1]) return 1;
			return 0;
		});
		occurrences.reverse();
		
		// 3
		occurrences.forEach(function(occurrence) {
			
			//console.log('occurrence:', occurrence)
			
			// 3.1 - +1 because occurrence[2] is the position of the last character
			// not the position of the character after the last
			output.push(escape(line.substring(occurrence[2]+1)));
			
			//console.log('adding to output: ', escape(line.substring(occurrence[2]+1)));
			
			// 3.2
			output.push(imgEmote(occurrence[0]));

			//console.log('adding to output: ', imgEmote(occurrence[0]));
			
			// 3.3
			line = line.substring(0, occurrence[1]);
		});
		
		// 4
		output.push(escape(line));
		
		// 5
		output.reverse();
		
		return output.join('');
	};
});