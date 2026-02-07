<?php
namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\FFMpeg\Clipper\Image;
use App\Exceptions\VideoEditor\InvalidMaskCoverageException;
use App\Models\FFMpeg\Filters\Video\FilterGraph;

class MaskCoverage implements ValidationRule
{
    private string $path = ''; 
    private array $filterGraph;

    public function __construct(string $path, array $filterGraph) {
        $this->path = $path;
        $this->filterGraph = $filterGraph;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        try {

            $hasRemoveLogo = collect($this->filterGraph)->firstWhere('filterType', 'removeLogo');
            if ($hasRemoveLogo) {
                $imagePath = Image::getLogoMaskFullnameByPath($this->path);
                if ($imagePath) {
                    Image::getNonBlackPercentage($imagePath);
                }
            }
        } catch (InvalidMaskCoverageException $e) {
            $fail($e->getMessage());
        }
    }
}