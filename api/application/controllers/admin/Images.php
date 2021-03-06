<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Images extends CI_Controller {

    public function __construct ()
    {
        parent::__construct();

        $this->load->model('admin/Products_model');

    }

    public function upload( $id )
    {

        if ( !empty( $_FILES ) ) {

            $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];

            $basePath = FCPATH . '..' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
            $basePath = $basePath . $id . DIRECTORY_SEPARATOR;

            mkdir( $basePath , 0777 );

            $uploadPath = $basePath . $_FILES[ 'file' ][ 'name' ];

            move_uploaded_file( $tempPath, $uploadPath );

            $answer = array( 'answer' => 'File transfer completed' );

            $json = json_encode( $answer );

            echo $json;

        } else {

            echo 'No files';

        }

    }

    public function uploadPromo ()
    {

        if ( !empty( $_FILES ) ) {

            $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];

            $basePath = FCPATH . '..' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
            $basePath = $basePath . 'promotions' . DIRECTORY_SEPARATOR;


            $uploadPath = $basePath . $_FILES[ 'file' ][ 'name' ];

            move_uploaded_file( $tempPath, $uploadPath );

            $answer = array( 'answer' => 'File transfer completed' );

            $json = json_encode( $answer );

            echo $json;

        } else {

            echo 'No files';

        }

    }

    public function get( $id )
    {

        $basePath = FCPATH . '..' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
        $basePath = $basePath . $id . DIRECTORY_SEPARATOR;

        if ( !is_dir($basePath) ) {
            return;
        }

        $files = scandir($basePath);
        $files = array_diff($files, array('.', '..'));

        $imagePath = 'uploads' . DIRECTORY_SEPARATOR;
        $imagePath = $imagePath . $id . DIRECTORY_SEPARATOR;

        $newFiles = array();

        foreach ($files as $file) {
            $newFiles[] = $imagePath . $file;
        }

        echo json_encode($newFiles);

    }

    public function delete()
    {

        $post = file_get_contents('php://input');
        $_POST = json_decode($post, true);

        $token = $this->input->post('token');
        $token = $this->jwt->decode($token, config_item('encryption_key'));

        if ($token->role != 'admin') {

            exit('You are not admin');

        }

//        $id = $this->input->post('id');
        $image = $this->input->post('image');
        $imagePath = FCPATH . '..' . DIRECTORY_SEPARATOR . $image;
        unlink($imagePath);

    }


    public function setThumbnail ()
    {

        $post = file_get_contents('php://input');
        $_POST = json_decode($post, true);

        $token = $this->input->post('token');
        $token = $this->jwt->decode($token, config_item('encryption_key'));

        if ($token->role != 'admin') {

            exit('You are not admin');

        }

        $input = $this->input->post('product');
        $productId = $input['id'];
        $imageName = $this->input->post('image');

        $product['thumbnail'] = $imageName;

        $this->Products_model->setThumbnail($productId, $product);

    }

}
