use strict;
use warnings;

use Data::Dumper;

local $\ = "\n";

my ($acronym) = @ARGV;
$acronym = uc($acronym);

if( length($acronym) != 3 ) {
	print "Not a 3 letter acronym.";
	exit;
}

my $first = lc( substr($acronym, 0, 1) );
my $file = "$first.txt";
if( !-e $file ) {
	print "No file for $first.";
	exit 0;
}

open(my $IN, "<", $file);
while( my $line = <$IN> ) {
	chomp $line;
	next if $line =~ m/\A\s*\z/;

	my ($tla, $desc) = split /\t/, $line;
	if( $tla eq $acronym ) {
		print $desc if $desc;
		exit 0;
	}
}
close($IN);

print "Not Found :(";
exit 0;
