<pre>
<?php

$map = array(
	'epsilon' => 'ε',
	'lambda' => 'λ',
	'mu' => 'μ',
	'rho' => 'ρ',
	'tau' => 'τ',
	'theta' => 'θ',
);


$result = array();
// read all files from tsv
if ($handle = opendir('tsv')) {

    /* This is the correct way to loop over the directory. */
    while (false !== ($entry = readdir($handle))) {
		if ($entry[0] != ".") {
			
			$title = explode("_", $entry);
			$s = $title[0];
			$s = str_replace("s", "", $s);
			$r = $title[1];
			$r = str_replace("r", "", $r);
			
			$v = explode(".", $title[2]);
			$v = $map[$v[0]];
						
			
			if (!isset($result[$s])) $result[$s] = array();
			if (!isset($result[$s][$r])) $result[$s][$r] = array();

			
			$data = file_get_contents("tsv/" . $entry);
			$data = explode("\n", $data);
			array_shift($data);
			
			foreach($data as $content) {
				if (empty($content)) continue;
				$a = explode("\t", $content);
			//	print_r($a);
				$d = $a[0];
				$f = $a[1];
				$x = $a[2];
				$x = ($x=='na') ? 'null' : $x;
				
				if (!isset($result[$s][$r][$d])) $result[$s][$r][$d] = array();
				if (!isset($result[$s][$r][$d][$f])) $result[$s][$r][$d][$f] = array();
				$result[$s][$r][$d][$f][$v] = (float)$x;
				
			}
			
			
			
		}
    }


    closedir($handle);

	$result = array_values($result);		// 1st level
	
	foreach($result as &$r2) {
		$r2 = array_values($r2);
		
		foreach($r2 as &$r3) {
			$r3 = array_values($r3);
			
			foreach($r3 as &$r4) {
				$r4 = array_values($r4);
			}
			
		}
	}
	
	
//	print_r($result);
	
	
	
	$result = json_encode($result);
	print_r($result);
	
}




?>
</pre>