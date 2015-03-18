import unittest
import pep8
import fnmatch
import os


class TestCodeStyle(unittest.TestCase):

    def test_pep8_conformance(self):
        """Test that we conform to PEP8."""
        localdir = os.path.dirname(os.path.realpath(__file__))
        pep8style = pep8.StyleGuide(quiet=True)
        directories = [
            'bin',
            'handlers',
            'tests',
        ]
        for directory in directories:
            start_dir = os.path.join(localdir, '../{}'.format(directory))
            for root, dirs, files in os.walk(start_dir):
                for basename in files:
                    if fnmatch.fnmatch(basename, '*.py'):
                        result = pep8style.input_file(
                            os.path.join(root, basename)
                        )
                        self.assertEqual(
                            result,
                            0,
                            'Found code style errors in {}'.format(
                                os.path.normpath(os.path.join(root, basename))
                            )
                        )


if __name__ == '__main__':
    unittest.main()
