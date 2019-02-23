use strict;
use warnings;

use Data::Dumper;

local $\ = "\n";

my %letters;
@letters{'A'..'Z'} = ( );

# read
my @files = glob "*.txt";

for my $file (@files) {
	open(my $IN, "<", $file);

	while( my $line = <$IN> ) {
		chomp $line;
		my ($tla,$desc) = split /\t/, $line;
		next if !defined $tla;
		$letters{ substr($tla, 0, 1) }->{$tla} = $desc;
	}

	close($IN);
}


# stats
my $stats = {};
for my $l ('A' .. 'Z') {
	$stats->{$l}->{count} = scalar keys %{ $letters{$l} };
}

my $total = 26 * 26;
my $sum = 0;
print "_\tN\t%";
for my $l ('A'..'Z') {
	my $count = $stats->{$l}->{count};
	$sum += $count;
	printf("%s\t%d\t%.2f\n", $l, $count, (100*$count)/$total); 
}
printf("*\t%d\t%.2f\n", $sum, (100 * $sum)/(26*$total));

print "Done.";
